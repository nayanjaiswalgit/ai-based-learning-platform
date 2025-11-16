import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../config/prisma.service';
import { RedisService } from '../../config/redis.service';
import { EmailService } from '../../config/email.service';
import { RegisterDto } from '../../dto/register.dto';
import { LoginDto } from '../../dto/login.dto';
import { ForgotPasswordDto } from '../../dto/forgot-password.dto';
import { ResetPasswordDto } from '../../dto/reset-password.dto';

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 10;
  private readonly ACCESS_TOKEN_EXPIRY = '15m';
  private readonly REFRESH_TOKEN_EXPIRY = '7d';

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private redisService: RedisService,
    private emailService: EmailService,
  ) {}

  // ==================== REGISTRATION ====================

  async register(registerDto: RegisterDto, ipAddress?: string, userAgent?: string) {
    const { email, username, password, fullName } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new ConflictException('Email already registered');
      }
      throw new ConflictException('Username already taken');
    }

    // Hash password with bcrypt (10 rounds)
    const passwordHash = await bcrypt.hash(password, this.SALT_ROUNDS);

    // Create user and profile in a transaction
    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          username,
          passwordHash,
          role: 'STUDENT',
          isEmailVerified: false,
          isActive: true,
        },
      });

      await tx.userProfile.create({
        data: {
          userId: newUser.id,
          fullName: fullName || username,
        },
      });

      return newUser;
    });

    // Generate email verification token
    const verificationToken = uuidv4();
    const tokenHash = await bcrypt.hash(verificationToken, 8);

    await this.prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    // Send verification email (async, don't wait)
    this.emailService
      .sendVerificationEmail(email, verificationToken)
      .catch((err) => console.error('Failed to send verification email:', err));

    return {
      message: 'Registration successful. Please check your email to verify your account.',
      userId: user.id,
    };
  }

  // ==================== EMAIL VERIFICATION ====================

  async verifyEmail(token: string) {
    const tokens = await this.prisma.emailVerificationToken.findMany({
      where: {
        usedAt: null,
        expiresAt: { gte: new Date() },
      },
      include: { user: true },
    });

    let verificationToken = null;
    for (const t of tokens) {
      const isValid = await bcrypt.compare(token, t.tokenHash);
      if (isValid) {
        verificationToken = t;
        break;
      }
    }

    if (!verificationToken) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    // Update user and mark token as used
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: verificationToken.userId },
        data: { isEmailVerified: true },
      }),
      this.prisma.emailVerificationToken.update({
        where: { id: verificationToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    // Send welcome email
    this.emailService
      .sendWelcomeEmail(
        verificationToken.user.email,
        verificationToken.user.username,
      )
      .catch((err) => console.error('Failed to send welcome email:', err));

    return { message: 'Email verified successfully' };
  }

  // ==================== LOGIN ====================

  async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string) {
    const { email, password, twoFactorCode } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Check 2FA if enabled
    if (user.twoFactorEnabled) {
      if (!twoFactorCode) {
        return {
          requiresTwoFactor: true,
          message: 'Please provide 2FA code',
        };
      }

      const isValid = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: twoFactorCode,
        window: 2,
      });

      if (!isValid) {
        throw new UnauthorizedException('Invalid 2FA code');
      }
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // Store refresh token
    const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 8);
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: refreshTokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        ipAddress,
        userAgent,
      },
    });

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        profile: user.profile,
      },
    };
  }

  // ==================== TOKEN GENERATION ====================

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.REFRESH_TOKEN_EXPIRY,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
    };
  }

  // ==================== REFRESH TOKEN ====================

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);

      // Find valid refresh token in database
      const tokens = await this.prisma.refreshToken.findMany({
        where: {
          userId: payload.sub,
          revokedAt: null,
          expiresAt: { gte: new Date() },
        },
      });

      let validToken = null;
      for (const t of tokens) {
        const isValid = await bcrypt.compare(refreshToken, t.tokenHash);
        if (isValid) {
          validToken = t;
          break;
        }
      }

      if (!validToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new tokens
      const newTokens = await this.generateTokens(
        payload.sub,
        payload.email,
        payload.role,
      );

      // Revoke old refresh token and create new one
      const newRefreshTokenHash = await bcrypt.hash(newTokens.refreshToken, 8);

      await this.prisma.$transaction([
        this.prisma.refreshToken.update({
          where: { id: validToken.id },
          data: { revokedAt: new Date() },
        }),
        this.prisma.refreshToken.create({
          data: {
            userId: payload.sub,
            tokenHash: newRefreshTokenHash,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        }),
      ]);

      return newTokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // ==================== LOGOUT ====================

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      // Revoke specific refresh token
      const tokens = await this.prisma.refreshToken.findMany({
        where: {
          userId,
          revokedAt: null,
        },
      });

      for (const t of tokens) {
        const isValid = await bcrypt.compare(refreshToken, t.tokenHash);
        if (isValid) {
          await this.prisma.refreshToken.update({
            where: { id: t.id },
            data: { revokedAt: new Date() },
          });
          break;
        }
      }
    } else {
      // Revoke all refresh tokens for user
      await this.prisma.refreshToken.updateMany({
        where: {
          userId,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });
    }

    return { message: 'Logged out successfully' };
  }

  // ==================== PASSWORD RESET ====================

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // Don't reveal if user exists for security
    if (!user) {
      return {
        message: 'If the email exists, a password reset link has been sent',
      };
    }

    // Generate reset token
    const resetToken = uuidv4();
    const tokenHash = await bcrypt.hash(resetToken, 8);

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    // Send reset email
    this.emailService
      .sendPasswordResetEmail(email, resetToken)
      .catch((err) => console.error('Failed to send reset email:', err));

    return {
      message: 'If the email exists, a password reset link has been sent',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;

    const tokens = await this.prisma.passwordResetToken.findMany({
      where: {
        usedAt: null,
        expiresAt: { gte: new Date() },
      },
    });

    let resetToken = null;
    for (const t of tokens) {
      const isValid = await bcrypt.compare(token, t.tokenHash);
      if (isValid) {
        resetToken = t;
        break;
      }
    }

    if (!resetToken) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

    // Update password and mark token as used
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
      // Revoke all refresh tokens for security
      this.prisma.refreshToken.updateMany({
        where: { userId: resetToken.userId },
        data: { revokedAt: new Date() },
      }),
    ]);

    return { message: 'Password reset successfully' };
  }

  // ==================== 2FA (Two-Factor Authentication) ====================

  async generate2FASecret(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const secret = speakeasy.generateSecret({
      name: `${this.configService.get('TWO_FA_APP_NAME')} (${user.email})`,
      length: 32,
    });

    // Temporarily store secret (will be saved permanently after verification)
    await this.redisService.set(
      `2fa:temp:${userId}`,
      secret.base32,
      600, // 10 minutes
    );

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    return {
      secret: secret.base32,
      qrCode: qrCodeUrl,
    };
  }

  async enable2FA(userId: string, code: string) {
    const tempSecret = await this.redisService.get(`2fa:temp:${userId}`);

    if (!tempSecret) {
      throw new BadRequestException('2FA setup expired. Please start again.');
    }

    const isValid = speakeasy.totp.verify({
      secret: tempSecret,
      encoding: 'base32',
      token: code,
      window: 2,
    });

    if (!isValid) {
      throw new BadRequestException('Invalid 2FA code');
    }

    // Enable 2FA and save secret
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: tempSecret,
        twoFactorEnabled: true,
      },
    });

    // Clean up temp secret
    await this.redisService.del(`2fa:temp:${userId}`);

    return { message: '2FA enabled successfully' };
  }

  async disable2FA(userId: string, code: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.twoFactorEnabled) {
      throw new BadRequestException('2FA is not enabled');
    }

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 2,
    });

    if (!isValid) {
      throw new BadRequestException('Invalid 2FA code');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: null,
        twoFactorEnabled: false,
      },
    });

    return { message: '2FA disabled successfully' };
  }

  // ==================== OAUTH ====================

  async handleOAuthLogin(
    provider: string,
    providerId: string,
    email: string,
    profile: any,
  ) {
    // Check if OAuth provider exists
    let oauthProvider = await this.prisma.oAuthProvider.findUnique({
      where: {
        provider_providerUserId: {
          provider: provider.toUpperCase() as any,
          providerUserId: providerId,
        },
      },
      include: { user: { include: { profile: true } } },
    });

    if (oauthProvider) {
      // User exists, generate tokens and login
      const tokens = await this.generateTokens(
        oauthProvider.user.id,
        oauthProvider.user.email,
        oauthProvider.user.role,
      );

      return {
        ...tokens,
        user: {
          id: oauthProvider.user.id,
          email: oauthProvider.user.email,
          username: oauthProvider.user.username,
          role: oauthProvider.user.role,
          profile: oauthProvider.user.profile,
        },
      };
    }

    // Check if user exists with this email
    let user = await this.prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user) {
      // Create new user
      const username = email.split('@')[0] + '_' + Date.now();
      const randomPassword = uuidv4();

      user = await this.prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            email,
            username,
            passwordHash: await bcrypt.hash(randomPassword, this.SALT_ROUNDS),
            role: 'STUDENT',
            isEmailVerified: true, // OAuth emails are pre-verified
            isActive: true,
            profilePictureUrl: profile.picture,
          },
        });

        await tx.userProfile.create({
          data: {
            userId: newUser.id,
            fullName: profile.displayName || profile.firstName + ' ' + profile.lastName,
          },
        });

        await tx.oAuthProvider.create({
          data: {
            userId: newUser.id,
            provider: provider.toUpperCase() as any,
            providerUserId: providerId,
            accessToken: profile.accessToken,
            refreshToken: profile.refreshToken,
          },
        });

        return tx.user.findUnique({
          where: { id: newUser.id },
          include: { profile: true },
        });
      });
    } else {
      // Link OAuth provider to existing user
      await this.prisma.oAuthProvider.create({
        data: {
          userId: user.id,
          provider: provider.toUpperCase() as any,
          providerUserId: providerId,
          accessToken: profile.accessToken,
          refreshToken: profile.refreshToken,
        },
      });
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        profile: user.profile,
      },
    };
  }

  // ==================== SAML SSO ====================

  async handleSAMLLogin(profile: any, organizationSlug?: string) {
    const { email, firstName, lastName, providerId } = profile;

    // Find organization if slug provided
    let organization = null;
    if (organizationSlug) {
      organization = await this.prisma.organization.findUnique({
        where: { slug: organizationSlug },
      });

      if (!organization || !organization.samlEnabled) {
        throw new UnauthorizedException('SAML not enabled for this organization');
      }
    }

    // Check if user exists
    let user = await this.prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user) {
      // Create new user
      const username = email.split('@')[0] + '_' + Date.now();
      const randomPassword = uuidv4();

      user = await this.prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            email,
            username,
            passwordHash: await bcrypt.hash(randomPassword, this.SALT_ROUNDS),
            role: 'STUDENT',
            isEmailVerified: true,
            isActive: true,
          },
        });

        await tx.userProfile.create({
          data: {
            userId: newUser.id,
            fullName: `${firstName} ${lastName}`,
          },
        });

        if (organization) {
          await tx.organizationMember.create({
            data: {
              organizationId: organization.id,
              userId: newUser.id,
              role: 'member',
            },
          });
        }

        return tx.user.findUnique({
          where: { id: newUser.id },
          include: { profile: true },
        });
      });
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        profile: user.profile,
      },
    };
  }
}
