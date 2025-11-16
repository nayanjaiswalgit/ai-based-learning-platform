import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CaptchaService } from '../../config/captcha.service';
import { RegisterDto } from '../../dto/register.dto';
import { LoginDto } from '../../dto/login.dto';
import { ForgotPasswordDto } from '../../dto/forgot-password.dto';
import { ResetPasswordDto } from '../../dto/reset-password.dto';
import { RefreshTokenDto } from '../../dto/refresh-token.dto';
import { Enable2FADto } from '../../dto/enable-2fa.dto';
import { Verify2FADto } from '../../dto/verify-2fa.dto';
import { Public } from '../../decorators/public.decorator';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly captchaService: CaptchaService,
  ) {}

  // ==================== REGISTRATION ====================

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'Email or username already exists' })
  async register(@Body() registerDto: RegisterDto, @Req() req: any) {
    // Verify CAPTCHA if provided
    if (registerDto.captchaToken) {
      await this.captchaService.verifyCaptcha(registerDto.captchaToken, 'register');
    }

    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];
    return this.authService.register(registerDto, ipAddress, userAgent);
  }

  // ==================== EMAIL VERIFICATION ====================

  @Public()
  @Get('verify-email')
  @ApiOperation({ summary: 'Verify email address' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  // ==================== LOGIN ====================

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto, @Req() req: any) {
    // Verify CAPTCHA if provided
    if (loginDto.captchaToken) {
      await this.captchaService.verifyCaptcha(loginDto.captchaToken, 'login');
    }

    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];
    return this.authService.login(loginDto, ipAddress, userAgent);
  }

  // ==================== REFRESH TOKEN ====================

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto.refreshToken);
  }

  // ==================== LOGOUT ====================

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout and revoke refresh tokens' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  async logout(@CurrentUser() user: any, @Body('refreshToken') refreshToken?: string) {
    return this.authService.logout(user.id, refreshToken);
  }

  // ==================== PASSWORD RESET ====================

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Password reset email sent if user exists' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  // ==================== 2FA (Two-Factor Authentication) ====================

  @UseGuards(JwtAuthGuard)
  @Get('2fa/generate')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate 2FA secret and QR code' })
  @ApiResponse({ status: 200, description: '2FA secret generated' })
  async generate2FA(@CurrentUser() user: any) {
    return this.authService.generate2FASecret(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/enable')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enable 2FA with verification code' })
  @ApiResponse({ status: 200, description: '2FA enabled successfully' })
  @ApiResponse({ status: 400, description: 'Invalid 2FA code' })
  async enable2FA(@CurrentUser() user: any, @Body() enable2FADto: Enable2FADto) {
    return this.authService.enable2FA(user.id, enable2FADto.code);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/disable')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Disable 2FA with verification code' })
  @ApiResponse({ status: 200, description: '2FA disabled successfully' })
  @ApiResponse({ status: 400, description: 'Invalid 2FA code' })
  async disable2FA(@CurrentUser() user: any, @Body() verify2FADto: Verify2FADto) {
    return this.authService.disable2FA(user.id, verify2FADto.code);
  }

  // ==================== OAUTH ====================

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  async googleAuth() {
    // Guard redirects to Google
  }

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleAuthCallback(@Req() req: any) {
    const { provider, providerId, email, ...profile } = req.user;
    return this.authService.handleOAuthLogin(provider, providerId, email, profile);
  }

  @Public()
  @Get('github')
  @UseGuards(AuthGuard('github'))
  @ApiOperation({ summary: 'Initiate GitHub OAuth login' })
  async githubAuth() {
    // Guard redirects to GitHub
  }

  @Public()
  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  @ApiOperation({ summary: 'GitHub OAuth callback' })
  async githubAuthCallback(@Req() req: any) {
    const { provider, providerId, email, ...profile } = req.user;
    return this.authService.handleOAuthLogin(provider, providerId, email, profile);
  }

  @Public()
  @Get('linkedin')
  @UseGuards(AuthGuard('linkedin'))
  @ApiOperation({ summary: 'Initiate LinkedIn OAuth login' })
  async linkedinAuth() {
    // Guard redirects to LinkedIn
  }

  @Public()
  @Get('linkedin/callback')
  @UseGuards(AuthGuard('linkedin'))
  @ApiOperation({ summary: 'LinkedIn OAuth callback' })
  async linkedinAuthCallback(@Req() req: any) {
    const { provider, providerId, email, ...profile } = req.user;
    return this.authService.handleOAuthLogin(provider, providerId, email, profile);
  }

  // ==================== SAML SSO ====================

  @Public()
  @Get('saml/:organizationSlug')
  @UseGuards(AuthGuard('saml'))
  @ApiOperation({ summary: 'Initiate SAML SSO login' })
  async samlAuth() {
    // Guard redirects to IdP
  }

  @Public()
  @Post('saml/:organizationSlug/callback')
  @UseGuards(AuthGuard('saml'))
  @ApiOperation({ summary: 'SAML SSO callback' })
  async samlAuthCallback(@Req() req: any, @Query('organizationSlug') organizationSlug: string) {
    return this.authService.handleSAMLLogin(req.user, organizationSlug);
  }

  // ==================== USER INFO ====================

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user info' })
  @ApiResponse({ status: 200, description: 'User info retrieved' })
  async getCurrentUser(@CurrentUser() user: any) {
    return user;
  }

  // ==================== CSRF TOKEN ====================

  @Public()
  @Get('csrf-token')
  @ApiOperation({ summary: 'Get CSRF token for forms' })
  @ApiResponse({ status: 200, description: 'CSRF token generated' })
  async getCsrfToken(@Req() req: any) {
    // Generate CSRF token and store in session
    const csrfToken = require('crypto').randomBytes(32).toString('hex');

    // Store in Redis with session
    const sessionId = req.sessionID || req.ip;
    await this.authService.storeCsrfToken(sessionId, csrfToken);

    return { csrfToken };
  }
}
