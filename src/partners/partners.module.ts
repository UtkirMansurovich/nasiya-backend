import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartnersService } from './partners.service';
import { PartnersController } from './partners.controller';
import { Partner } from './entities/partner.entity';
import { UsersModule } from '../users/users.module';
import { Investment } from 'src/investments/entities/investment.entity';
import { Credit } from 'src/credits/entities/credit.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Partner, Investment, Credit]),
    UsersModule,
  ],
  controllers: [PartnersController],
  providers: [PartnersService],
  exports: [PartnersService],
})
export class PartnersModule {}
