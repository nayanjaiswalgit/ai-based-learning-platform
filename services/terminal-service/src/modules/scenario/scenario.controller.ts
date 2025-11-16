import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ScenarioService, Scenario } from './scenario.service';

@Controller('scenarios')
export class ScenarioController {
  constructor(private readonly scenarioService: ScenarioService) {}

  @Get()
  listScenarios(@Query('category') category?: string): Scenario[] {
    return this.scenarioService.listScenarios(category);
  }

  @Get(':id')
  getScenario(@Param('id') id: string): Scenario {
    const scenario = this.scenarioService.getScenario(id);

    if (!scenario) {
      throw new Error(`Scenario ${id} not found`);
    }

    return scenario;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createScenario(
    @Body() scenarioData: Omit<Scenario, 'id' | 'createdAt' | 'updatedAt'>,
  ): Scenario {
    return this.scenarioService.createScenario(scenarioData);
  }

  @Put(':id')
  updateScenario(
    @Param('id') id: string,
    @Body() updates: Partial<Scenario>,
  ): Scenario {
    return this.scenarioService.updateScenario(id, updates);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteScenario(@Param('id') id: string): void {
    this.scenarioService.deleteScenario(id);
  }

  @Get(':id/hints')
  getHints(@Param('id') id: string): string[] {
    return this.scenarioService.getHints(id);
  }
}
