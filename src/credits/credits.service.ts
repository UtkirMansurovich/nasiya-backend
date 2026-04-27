import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Credit } from './entities/credit.entity';

@Injectable()
export class CreditsService {
  constructor(
    @InjectRepository(Credit)
    private creditRepository: Repository<Credit>,
  ) {}

  // Barcha nasiyalar
  async findAll() {
    return this.creditRepository.find({
      relations: ['customer', 'partner'],
    });
  }

  // Bitta nasiya
  async findOne(id: number) {
    const credit = await this.creditRepository.findOne({
      where: { id },
      relations: ['customer', 'partner'],
    });
    if (!credit) throw new NotFoundException('Nasiya topilmadi');
    return credit;
  }

  // Mijoz bo'yicha nasiyalar
  async findByCustomer(customerId: number) {
    return this.creditRepository.find({
      where: { customer: { id: customerId } },
      relations: ['customer', 'partner'],
    });
  }

  // Sherik bo'yicha nasiyalar
  async findByPartner(partnerId: number) {
    return this.creditRepository.find({
      where: { partner: { id: partnerId } },
      relations: ['customer', 'partner'],
    });
  }

  // Yangi nasiya qo'shish
  async create(data: any) {
    // total_debt avtomatik hisoblanadi
    const cost_price = Number(data.cost_price);
    const markup_percent = Number(data.markup_percent) || 30;
    const markup_amount = cost_price * (markup_percent / 100);
    const total_debt = cost_price + markup_amount;

    const credit = this.creditRepository.create({
      ...data,
      total_debt,
      remaining_debt: total_debt,
      paid_amount: 0,
    });

    return this.creditRepository.save(credit);
  }

  // Nasiyani tahrirlash
  async update(id: number, data: Partial<Credit>) {
    await this.findOne(id);
    await this.creditRepository.update(id, data);
    return this.findOne(id);
  }

  // Nasiyani o'chirish
  async remove(id: number) {
    await this.findOne(id);
    await this.creditRepository.delete(id);
    return { message: "Nasiya o'chirildi" };
  }
}
