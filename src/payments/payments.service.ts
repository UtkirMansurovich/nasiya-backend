import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { Credit } from '../credits/entities/credit.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,

    @InjectRepository(Credit)
    private creditRepository: Repository<Credit>,
  ) {}

  // Barcha to'lovlar
  async findAll() {
    return this.paymentRepository.find({
      relations: ['credit', 'credit.customer', 'credit.partner'],
    });
  }

  // Bitta to'lov
  async findOne(id: number) {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['credit', 'credit.customer', 'credit.partner'],
    });
    if (!payment) throw new NotFoundException("To'lov topilmadi");
    return payment;
  }

  // Nasiya bo'yicha to'lovlar
  async findByCredit(creditId: number) {
    return this.paymentRepository.find({
      where: { credit: { id: creditId } },
      relations: ['credit'],
    });
  }

  // Yangi to'lov qo'shish
  async create(data: any) {
    // Nasiyani topish
    const credit = await this.creditRepository.findOne({
      where: { id: data.credit.id },
    });
    if (!credit) throw new NotFoundException('Nasiya topilmadi');

    // To'lovni saqlash
    const payment = this.paymentRepository.create(data);
    await this.paymentRepository.save(payment);

    // Nasiya qoldiq summasini yangilash
    const paid_amount = Number(credit.paid_amount) + Number(data.amount);
    const remaining_debt = Number(credit.total_debt) - paid_amount;

    // Agar to'liq to'langan bo'lsa status o'zgaradi
    const status = remaining_debt <= 0 ? 'completed' : 'active';

    await this.creditRepository.update(credit.id, {
      paid_amount,
      remaining_debt,
      status,
    });

    return payment;
  }

  // To'lovni o'chirish
  async remove(id: number) {
    await this.findOne(id);
    await this.paymentRepository.delete(id);
    return { message: "To'lov o'chirildi" };
  }
}
