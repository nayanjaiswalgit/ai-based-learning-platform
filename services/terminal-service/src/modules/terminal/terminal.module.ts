import { Module } from '@nestjs/common';
import { TerminalGateway } from './terminal.gateway';
import { TerminalController } from './terminal.controller';
import { RecordingService } from './recording.service';
import { CollaborationService } from './collaboration.service';
import { DockerModule } from '../docker/docker.module';
import { SessionModule } from '../session/session.module';
import { ScenarioModule } from '../scenario/scenario.module';

@Module({
  imports: [DockerModule, SessionModule, ScenarioModule],
  providers: [TerminalGateway, RecordingService, CollaborationService],
  controllers: [TerminalController],
  exports: [RecordingService, CollaborationService],
})
export class TerminalModule {}
