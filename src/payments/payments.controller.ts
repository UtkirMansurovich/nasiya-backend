import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto, ImportPaymentDto } from './dto/payment.dto';

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

  @Get('customer/:customerId')
  findByCustomer(@Param('customerId') customerId: string) {
    return this.paymentsService.findByCustomer(+customerId);
  }

  @Get(':id') // ← eng oxirida
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(+id);
  }

  @Post()
  create(@Body() data: CreatePaymentDto) {
    return this.paymentsService.create(data);
  }

  @Post('import-bulk')
  importBulk(@Body() body: { payments: ImportPaymentDto[]; dates: string[] }) {
    return this.paymentsService.importBulk(body.payments, body.dates);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentsService.remove(+id);
  }
}
