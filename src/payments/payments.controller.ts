import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  // GET /payments
  @Get()
  findAll() {
    return this.paymentsService.findAll();
  }

  // GET /payments/:id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(+id);
  }

  // GET /payments/credit/:creditId
  @Get('credit/:creditId')
  findByCredit(@Param('creditId') creditId: string) {
    return this.paymentsService.findByCredit(+creditId);
  }

  // POST /payments
  @Post()
  create(@Body() data: any) {
    return this.paymentsService.create(data);
  }

  // DELETE /payments/:id
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentsService.remove(+id);
  }
}
