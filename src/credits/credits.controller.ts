import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { CreditsService } from './credits.service';

@Controller('credits')
export class CreditsController {
  constructor(private creditsService: CreditsService) {}

  // GET /credits
  @Get()
  findAll() {
    return this.creditsService.findAll();
  }

  // GET /credits/:id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.creditsService.findOne(+id);
  }

  // GET /credits/customer/:customerId
  @Get('customer/:customerId')
  findByCustomer(@Param('customerId') customerId: string) {
    return this.creditsService.findByCustomer(+customerId);
  }

  // GET /credits/partner/:partnerId
  @Get('partner/:partnerId')
  findByPartner(@Param('partnerId') partnerId: string) {
    return this.creditsService.findByPartner(+partnerId);
  }

  // POST /credits
  @Post()
  create(@Body() data: any) {
    return this.creditsService.create(data);
  }

  // PUT /credits/:id
  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.creditsService.update(+id, data);
  }

  // DELETE /credits/:id
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.creditsService.remove(+id);
  }
}
