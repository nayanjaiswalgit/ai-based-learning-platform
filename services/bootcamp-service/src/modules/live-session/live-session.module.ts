import { Module } from '@nestjs/common';
import { LiveSessionController } from './live-session.controller';
import { LiveSessionService } from './live-session.service';
import { ZoomIntegrationService } from './integrations/zoom.service';
import { GoogleMeetIntegrationService } from './integrations/google-meet.service';

@Module({
  controllers: [LiveSessionController],
  providers: [LiveSessionService, ZoomIntegrationService, GoogleMeetIntegrationService],
  exports: [LiveSessionService],
})
export class LiveSessionModule {}
