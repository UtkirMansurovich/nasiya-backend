import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { CreditsService } from './credits.service';
import { CreateCreditDto, ImportCreditDto } from './dto/create-credit.dto';
import { Credit } from './entities/credit.entity';

@Controller('credits')
export class CreditsController {
  constructor(private creditsService: CreditsService) {}

  // GET /credits
  @Get()
  findAll() {
    return this.creditsService.findAll();
  }

  // POST /credits/import-bulk
  @Post('import-bulk')
  importBulk(@Body() body: { credits: ImportCreditDto[] }) {
    return this.creditsService.importBulk(body.credits);
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

  // GET /credits/:id
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

  // PATCH /credits/:id/status
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() data: { status: 'active' | 'completed' | 'defaulted' },
  ) {
    return this.creditsService.updateStatus(+id, data.status);
  }

  // DELETE /credits/:id
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.creditsService.remove(+id);
  }
}
