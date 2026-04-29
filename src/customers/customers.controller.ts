import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { Customer } from './entities/customer.entity';

@Controller('customers')
export class CustomersController {
  constructor(private customersService: CustomersService) {}

  // GET /customers
  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return this.customersService.findAll(pageNumber, limitNumber);
  }

  // GET /customers/:id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(+id);
  }

  // POST /customers
  @Post()
  create(@Body() data: Partial<Customer>) {
    return this.customersService.create(data);
  }

  // PUT /customers/:id
  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<Customer>) {
    return this.customersService.update(+id, data);
  }

  // DELETE /customers/:id
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customersService.remove(+id);
  }

  @Post('upsert')
  upsert(@Body() data: Partial<Customer>) {
    return this.customersService.upsert(data);
  }
}
