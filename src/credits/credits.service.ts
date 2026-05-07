import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Credit } from './entities/credit.entity';
import { Partner } from '../partners/entities/partner.entity';
import { Customer } from '../customers/entities/customer.entity';
import {
  calculateWorkingDays,
  calculateTotalDebt,
  calculateDailyPayment,
} from '../utils/working-days';
import { CreateCreditDto } from './dto/create-credit.dto';

@Injectable()
export class CreditsService {
  constructor(
    @InjectRepository(Credit)
    private creditRepository: Repository<Credit>,

    @InjectRepository(Partner)
    private partnerRepository: Repository<Partner>,

    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  // Barcha nasiya
  async findAll() {
    return this.creditRepository.find({
      relations: ['customer', 'partner'],
      order: { start_date: 'DESC' },
    });
  }

  // Bitta nasiya
  async findOne(id: number) {
    const credit = await this.creditRepository.findOne({
      where: { id },
      relations: ['customer', 'partner', 'payments'],
    });
    if (!credit) throw new NotFoundException('Nasiya topilmadi');
    return credit;
  }

  // Mijoz bo'yicha nasiyalar
  async findByCustomer(customerId: number) {
    return this.creditRepository.find({
      where: { customer: { id: customerId } },
      relations: ['partner', 'payments'],
      order: { start_date: 'DESC' },
    });
  }

  // Sherik bo'yicha nasiyalar
  async findByPartner(partnerId: number) {
    return this.creditRepository.find({
      where: { partner: { id: partnerId } },
      relations: ['customer', 'payments'],
      order: { start_date: 'DESC' },
    });
  }

  // Yangi nasiya qo'shish
  async create(data: CreateCreditDto) {
    // 1. Mijozni tekshirish
    const customer = await this.customerRepository.findOne({
      where: { id: data.customerId },
    });
    if (!customer) throw new NotFoundException('Mijoz topilmadi');

    // 2. Sherikni tekshirish va balansdan ayirish
    let partner: Partner | null = null;
    if (data.partnerId) {
      partner = await this.partnerRepository.findOne({
        where: { id: data.partnerId },
      });
      if (!partner) throw new NotFoundException('Sherik topilmadi');

      // Sherik balansini tekshirish
      if (Number(partner.balance) < data.cost_price) {
        throw new BadRequestException(
          `Sherik balansida yetarli mablag' yo'q! Balans: ${partner.balance} so'm`,
        );
      }

      // Sherik balansidan ayirish
      await this.partnerRepository.update(partner.id, {
        balance: Number(partner.balance) - data.cost_price,
      });
    }

    // 3. Ishchi kunlarini hisoblash
    const workingDays = calculateWorkingDays(
      new Date(data.start_date),
      data.duration_days,
    );

    // 4. Jami qarz va kunlik to'lovni hisoblash
    const totalDebt = calculateTotalDebt(data.cost_price, data.markup_percent);
    const dailyPayment = calculateDailyPayment(totalDebt, workingDays);

    // 5. Nasiyani saqlash
    const credit = this.creditRepository.create({
      customer: { id: customer.id },
      partner: partner ? { id: partner.id } : undefined,
      product_name: data.product_name,
      cost_price: data.cost_price,
      markup_percent: data.markup_percent,
      duration_days: data.duration_days,
      working_days: workingDays,
      total_debt: totalDebt,
      remaining_debt: totalDebt,
      paid_amount: 0,
      daily_payment: dailyPayment,
      notes: data.notes,
      status: 'active',
    });

    return this.creditRepository.save(credit);
  }

  // Nasiya statusini yangilash
  async updateStatus(id: number, status: 'active' | 'completed' | 'defaulted') {
    await this.findOne(id);
    await this.creditRepository.update(id, { status });
    return this.findOne(id);
  }

  // Nasiyani tahrirlash
  async update(id: number, data: Partial<Credit>) {
    await this.findOne(id);
    await this.creditRepository.update(id, data);
    return this.findOne(id);
  }

  // Nasiyani o'chirish
  async remove(id: number) {
    const credit = await this.findOne(id);

    // Faqat active bo'lmagan nasiyani o'chirish mumkin
    if (credit.status === 'active') {
      throw new BadRequestException(
        "Aktiv nasiyani o'chirib bo'lmaydi! Avval nasiyani yoping.",
      );
    }

    await this.creditRepository.delete(id);
    return { message: "Nasiya o'chirildi" };
  }
}
