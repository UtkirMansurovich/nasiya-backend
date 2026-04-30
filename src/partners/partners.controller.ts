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
import { PartnersService } from './partners.service';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { Partner } from './entities/partner.entity';

@Controller('partners')
export class PartnersController {
  constructor(private partnersService: PartnersService) {}

  // GET /partners
  @Get()
  findAll() {
    return this.partnersService.findAll();
  }

  // GET /partners/:id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.partnersService.findOne(+id);
  }

  // POST /partners
  @Post()
  create(@Body() data: CreatePartnerDto) {
    return this.partnersService.create(data);
  }

  // PUT /partners/:id
  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<Partner>) {
    return this.partnersService.update(+id, data);
  }

  @Patch(':id/account')
  updateAccount(
    @Param('id') id: string,
    @Body() data: { username?: string; password?: string },
  ) {
    return this.partnersService.updateAccount(+id, data);
  }

  // DELETE /partners/:id
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.partnersService.remove(+id);
  }
}
