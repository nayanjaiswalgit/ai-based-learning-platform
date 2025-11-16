import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

// Modules
import { BootcampModule } from './modules/bootcamp/bootcamp.module';
import { CohortModule } from './modules/cohort/cohort.module';
import { LiveSessionModule } from './modules/live-session/live-session.module';
import { OneOnOneMeetingModule } from './modules/one-on-one-meeting/one-on-one-meeting.module';
import { AssignmentModule } from './modules/assignment/assignment.module';
import { CertificateModule } from './modules/certificate/certificate.module';
import { PrismaModule } from './common/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    BootcampModule,
    CohortModule,
    LiveSessionModule,
    OneOnOneMeetingModule,
    AssignmentModule,
    CertificateModule,
  ],
})
export class AppModule {}
