import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Credit } from '../credits/entities/credit.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Partner } from '../partners/entities/partner.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Credit)
    private creditRepository: Repository<Credit>,

    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,

    @InjectRepository(Partner)
    private partnerRepository: Repository<Partner>,
  ) {}

  // Umumiy hisobot
  async getSummary() {
    const credits = await this.creditRepository.find();

    const total_debt = credits.reduce(
      (sum, c) => sum + Number(c.total_debt),
      0,
    );
    const total_paid = credits.reduce(
      (sum, c) => sum + Number(c.paid_amount),
      0,
    );
    const total_remaining = credits.reduce(
      (sum, c) => sum + Number(c.remaining_debt),
      0,
    );
    const total_profit = credits.reduce((sum, c) => {
      const markup = Number(c.total_debt) - Number(c.cost_price);
      return sum + markup;
    }, 0);

    const active_credits = credits.filter((c) => c.status === 'active').length;
    const completed_credits = credits.filter(
      (c) => c.status === 'completed',
    ).length;
    const defaulted_credits = credits.filter(
      (c) => c.status === 'defaulted',
    ).length;

    return {
      total_debt,
      total_paid,
      total_remaining,
      total_profit,
      owner_profit: total_profit * 0.5,
      active_credits,
      completed_credits,
      defaulted_credits,
    };
  }

  // Sherik bo'yicha hisobot
  async getPartnerReport(partnerId: number) {
    const credits = await this.creditRepository.find({
      where: { partner: { id: partnerId } },
      relations: ['partner', 'customer'],
    });

    const total_invested = credits.reduce(
      (sum, c) => sum + Number(c.cost_price),
      0,
    );
    const total_debt = credits.reduce(
      (sum, c) => sum + Number(c.total_debt),
      0,
    );
    const total_paid = credits.reduce(
      (sum, c) => sum + Number(c.paid_amount),
      0,
    );
    const total_remaining = credits.reduce(
      (sum, c) => sum + Number(c.remaining_debt),
      0,
    );
    const total_profit = credits.reduce((sum, c) => {
      const markup = Number(c.total_debt) - Number(c.cost_price);
      return sum + markup;
    }, 0);

    return {
      partner_id: partnerId,
      total_invested,
      total_debt,
      total_paid,
      total_remaining,
      partner_profit: total_profit * 0.5,
      owner_profit: total_profit * 0.5,
      active_credits: credits.filter((c) => c.status === 'active').length,
      completed_credits: credits.filter((c) => c.status === 'completed').length,
      defaulted_credits: credits.filter((c) => c.status === 'defaulted').length,
      credits,
    };
  }

  // Bugungi to'lovlar
  async getTodayPayments() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.credit', 'credit')
      .leftJoinAndSelect('credit.customer', 'customer')
      .where('payment.payment_date >= :today', { today })
      .andWhere('payment.payment_date < :tomorrow', { tomorrow })
      .getMany();
  }

  // Muddati o'tgan nasiyalar
  async getDefaultedCredits() {
    return this.creditRepository.find({
      where: { status: 'defaulted' },
      relations: ['customer', 'partner'],
    });
  }
}
