import { Controller, Get, Post, Body } from '@nestjs/common';
import { OwnerService } from './owner.service';

@Controller('owner')
export class OwnerController {
  constructor(private ownerService: OwnerService) {}

  // GET /owner/balance
  @Get('balance')
  getBalance() {
    return this.ownerService.getBalance();
  }

  // POST /owner/add-balance
  @Post('add-balance')
  addBalance(@Body() data: { amount: number; notes?: string }) {
    return this.ownerService.addBalance(data.amount, data.notes);
  }
}
