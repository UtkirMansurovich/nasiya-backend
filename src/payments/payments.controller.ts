import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Get()
  findAll() {
    return this.paymentsService.findAll();
  }

  @Get('credit/:creditId') // ← :id dan OLDIN
  findByCredit(@Param('creditId') creditId: string) {
    return this.paymentsService.findByCredit(+creditId);
  }

  @Get(':id') // ← eng oxirida
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(+id);
  }

  @Post()
  create(@Body() data: CreatePaymentDto) {
    return this.paymentsService.create(data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentsService.remove(+id);
  }
}
