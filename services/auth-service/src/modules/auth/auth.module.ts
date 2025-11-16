import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from '../../config/prisma.service';
import { RedisService } from '../../config/redis.service';
import { EmailService } from '../../config/email.service';
import { CaptchaService } from '../../config/captcha.service';
import { JwtStrategy } from '../../strategies/jwt.strategy';
import { JwtRefreshStrategy } from '../../strategies/jwt-refresh.strategy';
import { GoogleStrategy } from '../../strategies/google.strategy';
import { GithubStrategy } from '../../strategies/github.strategy';
import { LinkedInStrategy } from '../../strategies/linkedin.strategy';
import { SamlStrategy } from '../../strategies/saml.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_EXPIRY') || '15m',
        },
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 10, // 10 requests per minute
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PrismaService,
    RedisService,
    EmailService,
    CaptchaService,
    JwtStrategy,
    JwtRefreshStrategy,
    GoogleStrategy,
    GithubStrategy,
    LinkedInStrategy,
    SamlStrategy,
  ],
  exports: [AuthService, JwtStrategy],
})
export class AuthModule {}
