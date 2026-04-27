import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Credit } from '../credits/entities/credit.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Partner } from '../partners/entities/partner.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Credit, Payment, Partner])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
