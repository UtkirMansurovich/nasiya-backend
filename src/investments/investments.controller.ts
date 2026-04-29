import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { InvestmentsService } from './investments.service';

@Controller('investments')
export class InvestmentsController {
  constructor(private investmentsService: InvestmentsService) {}

  // GET /investments/partner/:partnerId
  @Get('partner/:partnerId')
  findByPartner(@Param('partnerId') partnerId: string) {
    return this.investmentsService.findByPartner(+partnerId);
  }

  // POST / investments
  @Post()
  create(@Body() data: { partnerId: number; amount: number; notes?: string }) {
    return this.investmentsService.create(data);
  }

  // DELETE / investments/:id
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.investmentsService.removeEventListener(+id);
  }
}
