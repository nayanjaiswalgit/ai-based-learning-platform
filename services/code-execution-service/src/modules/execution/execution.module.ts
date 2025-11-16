import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ExecutionService } from './execution.service';
import { ExecutionController } from './execution.controller';
import { ExecutionProcessor } from './execution.processor';
import { DockerService } from './docker.service';
import { AntiCheatService } from './anti-cheat.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'code-execution',
      defaultJobOptions: {
        attempts: 3,
        removeOnComplete: 100, // Keep last 100 completed jobs
        removeOnFail: 200, // Keep last 200 failed jobs
      },
    }),
  ],
  controllers: [ExecutionController],
  providers: [
    ExecutionService,
    ExecutionProcessor,
    DockerService,
    AntiCheatService,
  ],
  exports: [ExecutionService],
})
export class ExecutionModule {}
