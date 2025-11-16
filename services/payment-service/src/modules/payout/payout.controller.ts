import { Controller, Get, Post, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PayoutService } from './payout.service';

@ApiTags('payouts')
@ApiBearerAuth()
@Controller('payouts')
export class PayoutController {
  constructor(private readonly payoutService: PayoutService) {}

  @Get('earnings/:instructorId')
  @ApiOperation({ summary: 'Get instructor earnings' })
  async getEarnings(@Param('instructorId') instructorId: string) {
    return this.payoutService.getInstructorEarnings(instructorId);
  }

  @Post('create/:instructorId')
  @ApiOperation({ summary: 'Create payout for instructor' })
  async createPayout(@Param('instructorId') instructorId: string) {
    return this.payoutService.createPayout(instructorId);
  }

  @Get('history/:instructorId')
  @ApiOperation({ summary: 'Get payout history' })
  async getPayoutHistory(@Param('instructorId') instructorId: string) {
    return this.payoutService.getPayoutHistory(instructorId);
  }
}
