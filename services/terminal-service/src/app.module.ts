import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminalModule } from './modules/terminal/terminal.module';
import { ScenarioModule } from './modules/scenario/scenario.module';
import { SessionModule } from './modules/session/session.module';
import { DockerModule } from './modules/docker/docker.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TerminalModule,
    ScenarioModule,
    SessionModule,
    DockerModule,
  ],
})
export class AppModule {}
