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
import { CreateCreditDto, ImportCreditDto } from './dto/create-credit.dto';
import { OwnerService } from 'src/owner/owner.service';

@Injectable()
export class CreditsService {
  constructor(
    @InjectRepository(Credit)
    private creditRepository: Repository<Credit>,

    @InjectRepository(Partner)
    private partnerRepository: Repository<Partner>,

    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,

    private ownerService: OwnerService,
  ) {}

  // Barcha nasiya
  async findAll() {
    return this.creditRepository.find({
      relations: ['customer', 'partner', 'payments'], // ← 'payments' qo'shildi
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

    // 2. Sherik yoki Asosiy kishi mablag'ini tekshirish
    let partner: Partner | null = null;

    if (data.partnerId) {
      // Sherik mablag'i
      partner = await this.partnerRepository.findOne({
        where: { id: data.partnerId },
      });
      if (!partner) throw new NotFoundException('Sherik topilmadi');

      if (Number(partner.balance) < data.cost_price) {
        throw new BadRequestException(
          `Sherik balansida yetarli mablag' yo'q! Balans: ${partner.balance} so'm`,
        );
      }

      await this.partnerRepository.update(partner.id, {
        balance: Number(partner.balance) - data.cost_price,
      });
    } else {
      // Asosiy kishi mablag'i
      await this.ownerService.deductBalance(data.cost_price);
    }

    // 3. Ishchi kunlarni hisoblash
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

  // Nasiyalarni Excel orqali yuklash
  async importBulk(creditsData: ImportCreditDto[]) {
    let created = 0;
    const errors: { row: number; phone: string; message: string }[] = [];

    for (let i = 0; i < creditsData.length; i++) {
      const data = creditsData[i];
      try {
        // Remove spaces and '+' from phone for robust search
        const rawPhone = String(data.customer_phone || '').trim();
        const searchPhone = rawPhone.replace(/\D/g, '');

        if (!searchPhone) {
          errors.push({
            row: i + 2,
            phone: rawPhone,
            message: 'Telefon raqami kiritilmagan',
          });
          continue;
        }

        // Try exact match or match ignoring non-digits
        // For simplicity we try to find a customer where the stored phone contains the search phone or vice-versa
        const customer = await this.customerRepository
          .createQueryBuilder('customer')
          .where(
            "REPLACE(REPLACE(customer.phone, '+', ''), ' ', '') LIKE :phone",
            { phone: `%${searchPhone}%` },
          )
          .getOne();

        if (!customer) {
          errors.push({
            row: i + 2,
            phone: rawPhone,
            message: "Ushbu raqamli mijoz bazada yo'q",
          });
          continue;
        }

        const dto: CreateCreditDto = {
          customerId: customer.id,
          product_name: data.product_name,
          cost_price: Number(data.cost_price),
          markup_percent: Number(data.markup_percent || 30),
          duration_days: Number(data.duration_days || 30),
          start_date: data.start_date || new Date().toISOString(),
          notes: data.notes,
        };

        await this.create(dto);
        created++;
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Xatolik yuz berdi';
        errors.push({
          row: i + 2,
          phone: data.customer_phone || '',
          message: errorMessage,
        });
      }
    }

    return { created, errors };
  }

  // Nasiya statusini yangilash
  async updateStatus(id: number, status: 'active' | 'completed' | 'defaulted') {
    const credit = await this.findOne(id);

    if (status === 'completed') {
      const profit = Number(credit.total_debt) - Number(credit.cost_price);

      if (credit.partner) {
        // Sherik mablag'i bilan berilgan nasiya
        const partnerProfit = profit * 0.5;
        const ownerProfit = profit * 0.5;

        // Sherik: mablag' + 50% foyda qaytadi
        await this.partnerRepository.update(credit.partner.id, {
          balance:
            Number(credit.partner.balance) +
            Number(credit.cost_price) +
            partnerProfit,
          total_profit: Number(credit.partner.total_profit) + partnerProfit,
        });

        // Asosiy kishi: 50% foyda
        await this.ownerService.addProfit(ownerProfit);
      } else {
        // Asosiy kishi mablag'i bilan berilgan nasiya
        // 100% foyda asosiy kishiga
        await this.ownerService.addProfit(profit);
        await this.ownerService.addBalance(Number(credit.cost_price));
      }
    }

    if (status === 'defaulted') {
      const loss = Number(credit.remaining_debt);

      if (credit.partner) {
        // Sherik mablag'i bilan berilgan nasiya
        const partnerLoss = loss * 0.5;
        const ownerLoss = loss * 0.5;

        // Sherik: 50% zarar
        await this.partnerRepository.update(credit.partner.id, {
          total_loss: Number(credit.partner.total_loss) + partnerLoss,
        });

        // Asosiy kishi: 50% zarar qoplaydi
        await this.ownerService.addLoss(ownerLoss);
      } else {
        // Asosiy kishi mablag'i bilan berilgan nasiya
        // 100% zarar asosiy kishiga
        await this.ownerService.addLoss(loss);
      }
    }

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
