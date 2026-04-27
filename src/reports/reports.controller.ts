import { Controller, Get, Param } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  // GET /reports/summary
  @Get('summary')
  getSummary() {
    return this.reportsService.getSummary();
  }

  // GET /reports/partner/:id
  @Get('partner/:id')
  getPartnerReport(@Param('id') id: string) {
    return this.reportsService.getPartnerReport(+id);
  }

  // GET /reports/today-payments
  @Get('today-payments')
  getTodayPayments() {
    return this.reportsService.getTodayPayments();
  }

  // GET /reports/defaulted
  @Get('defaulted')
  getDefaultedCredits() {
    return this.reportsService.getDefaultedCredits();
  }
}
