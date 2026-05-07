import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Patch,
} from '@nestjs/common';
import { CreditsService } from './credits.service';
import { CreateCreditDto } from './dto/create-credit.dto';
import { Credit } from './entities/credit.entity';

@Controller('credits')
export class CreditsController {
  constructor(private creditsService: CreditsService) {}

  // GET /credits
  @Get()
  findAll() {
    return this.creditsService.findAll();
  }

  // GET /customer/:customerId
  @Get('customer/:cutomerId')
  findByCustomer(@Param('customerId') customerId: string) {
    return this.creditsService.findByCustomer(+customerId);
  }

  // GET /partner/:partnerId
  @Get('partner/:partnerId')
  findByPartner(@Param('partnerId') partnerId: string) {
    return this.creditsService.findByPartner(+partnerId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.creditsService.findOne(+id);
  }

  // POST /credits
  @Post()
  create(@Body() data: CreateCreditDto) {
    return this.creditsService.create(data);
  }

  // PUT /credits/:id
  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<Credit>) {
    return this.creditsService.update(+id, data);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'active' | 'completed' | 'defaulted',
  ) {
    return this.creditsService.updateStatus(+id, status);
  }

  // DELETE /credits/:id
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.creditsService.remove(+id);
  }
}
