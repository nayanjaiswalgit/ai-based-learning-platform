import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class CaptchaService {
  private readonly secretKey: string;

  constructor(private configService: ConfigService) {
    this.secretKey = this.configService.get<string>('RECAPTCHA_SECRET_KEY');
  }

  async verifyCaptcha(token: string, action?: string): Promise<boolean> {
    if (!this.secretKey) {
      // If CAPTCHA is not configured, skip verification (for development)
      console.warn('CAPTCHA verification skipped - secret key not configured');
      return true;
    }

    try {
      const response = await axios.post(
        'https://www.google.com/recaptcha/api/siteverify',
        null,
        {
          params: {
            secret: this.secretKey,
            response: token,
          },
        },
      );

      const { success, score, action: responseAction } = response.data;

      // For reCAPTCHA v3, check the score (0.0 - 1.0)
      // Higher scores indicate more likely human interaction
      if (score !== undefined) {
        const minScore = 0.5; // Adjust threshold as needed
        if (score < minScore) {
          throw new BadRequestException('CAPTCHA verification failed - low score');
        }
      }

      // Verify action matches if provided
      if (action && responseAction !== action) {
        throw new BadRequestException('CAPTCHA action mismatch');
      }

      return success;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('CAPTCHA verification error:', error);
      throw new BadRequestException('CAPTCHA verification failed');
    }
  }
}
