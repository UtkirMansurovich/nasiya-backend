import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Investment } from './entities/investment.entity';
import { Partner } from '../partners/entities/partner.entity';

@Injectable()
export class InvestmentsService {
  constructor(
    @InjectRepository(Investment)
    private investmentRepository: Repository<Investment>,

    @InjectRepository(Partner)
    private partnerRepository: Repository<Partner>,
  ) {}

  // Sherik bo'yicha investitsiyalar
  async findByPartner(partnerId: number) {
    return this.investmentRepository.find({
      where: { partner: { id: partnerId } },
      relations: ['partner'],
      order: { created_at: 'DESC' },
    });
  }

  //   Yangi investitsiya qo'shish
  async create(data: { partnerId: number; amount: number; notes?: string }) {
    // 1. Partnerni topish
    const partner = await this.partnerRepository.findOne({
      where: { id: data.partnerId },
    });
    if (!partner) throw new NotFoundException('Sherik topilmadi');

    // 2. Investitsiyani saqlash
    const investment = this.investmentRepository.create({
      partner,
      amount: data.amount,
      notes: data.notes,
    });
    await this.investmentRepository.save(investment);

    // 3. Partner balance va total_invested ni yangilash
    await this.partnerRepository.update(partner.id, {
      balance: Number(partner.balance) + Number(data.amount),
      total_invested: Number(partner.total_invested) + Number(data.amount),
    });

    return investment;
  }

  // Investitsiyani o'chirish
  async removeEventListener(id: number) {
    const investment = await this.investmentRepository.findOne({
      where: { id },
      relations: ['partner'],
    });
    if (!investment) throw new NotFoundException('Investitsiya topilmadi');

    // Partner balance ni qaytarish
    await this.partnerRepository.update(investment.partner.id, {
      balance: Number(investment.partner.balance) - Number(investment.amount),
      total_invested:
        Number(investment.partner.total_invested) - Number(investment.amount),
    });

    await this.investmentRepository.delete(id);
    return { message: "Investitsiya o'chirildi" };
  }
}
