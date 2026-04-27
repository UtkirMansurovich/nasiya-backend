import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { PartnersService } from './partners.service';
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
  create(@Body() data: Partial<Partner>) {
    return this.partnersService.create(data);
  }

  // PUT /partners/:id
  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<Partner>) {
    return this.partnersService.update(+id, data);
  }

  // DELETE /partners/:id
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.partnersService.remove(+id);
  }
}
