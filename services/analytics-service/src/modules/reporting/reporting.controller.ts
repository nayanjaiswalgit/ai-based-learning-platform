import { Controller, Get, Param, Res, Query } from '@nestjs/common'
import { Response } from 'express'
import { ReportingService } from './reporting.service'

@Controller('reports')
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  @Get('weekly/:userId')
  async getWeeklyReport(@Param('userId') userId: string) {
    return this.reportingService.generateWeeklyReport(userId)
  }

  @Get('monthly/:userId')
  async getMonthlyReport(
    @Param('userId') userId: string,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.reportingService.generateMonthlyReport(userId, month, year)
  }

  @Get('instructor/:instructorId')
  async getInstructorReport(@Param('instructorId') instructorId: string) {
    return this.reportingService.generateInstructorReport(instructorId)
  }

  @Get('weekly/:userId/export/csv')
  async exportWeeklyCSV(@Param('userId') userId: string, @Res() res: Response) {
    const csv = await this.reportingService.exportWeeklyReportCSV(userId)
    res.header('Content-Type', 'text/csv')
    res.header('Content-Disposition', `attachment; filename=weekly-report-${userId}.csv`)
    res.send(csv)
  }

  @Get('weekly/:userId/export/pdf')
  async exportWeeklyPDF(@Param('userId') userId: string, @Res() res: Response) {
    const pdf = await this.reportingService.exportWeeklyReportPDF(userId)
    res.header('Content-Type', 'application/pdf')
    res.header('Content-Disposition', `attachment; filename=weekly-report-${userId}.pdf`)
    res.send(pdf)
  }
}
