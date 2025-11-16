import { Module } from '@nestjs/common';
import { ScenarioService } from './scenario.service';
import { ScenarioController } from './scenario.controller';

@Module({
  providers: [ScenarioService],
  controllers: [ScenarioController],
  exports: [ScenarioService],
})
export class ScenarioModule {}
