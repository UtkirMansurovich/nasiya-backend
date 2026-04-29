import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  // Barcha mijozlarni olish
  async findAll(page: number = 1, limit: number = 10) {
    const [data, total] = await this.customerRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { id: 'DESC' },
      relations: ['credits', 'credits.payments'],
    });

    const enrichedData = data.map((customer) => this.calculateStats(customer));

    return { data: enrichedData, total, page, limit };
  }

  // Bitta mijozni olish
  async findOne(id: number) {
    const customer = await this.customerRepository.findOne({
      where: { id },
      relations: ['credits', 'credits.payments'],
    });
    if (!customer) throw new NotFoundException('Mijoz topilmadi');
    return this.calculateStats(customer);
  }

  private calculateStats(customer: any) {
    const credits = customer.credits || [];
    let jami_qarz = 0; // Tannarx (Principal)
    let jami_qarz_va_foyda = 0; // Jami qaytishi kerak bo'lgan summa (Total Debt)
    let tolangan = 0;
    let qolgan_qarz = 0;
    let oxirgi_sana: Date | null = null;
    let total_markup_percent = 0;

    credits.forEach((credit) => {
      jami_qarz += Number(credit.cost_price || 0);
      jami_qarz_va_foyda += Number(credit.total_debt || 0);
      tolangan += Number(credit.paid_amount || 0);
      qolgan_qarz += Number(credit.remaining_debt || 0);
      total_markup_percent += Number(credit.markup_percent || 0);

      if (credit.payments && credit.payments.length > 0) {
        credit.payments.forEach((payment) => {
          const pDate = new Date(payment.payment_date);
          if (!oxirgi_sana || pDate > oxirgi_sana) {
            oxirgi_sana = pDate;
          }
        });
      }
    });

    const ustama_foiz =
      credits.length > 0 ? total_markup_percent / credits.length : 0;
    const foyda = jami_qarz_va_foyda - jami_qarz;

    // Overall status logic
    let status = 'none';
    if (credits.length > 0) {
      if (credits.some((c) => c.status === 'defaulted')) {
        status = 'defaulted';
      } else if (credits.some((c) => c.status === 'active')) {
        status = 'active';
      } else {
        status = 'completed';
      }
    }

    return {
      ...customer,
      stats: {
        jami_qarz,
        ustama_foiz,
        jami_qarz_va_foyda,
        foyda,
        tolangan,
        qolgan_qarz,
        oxirgi_sana,
        status,
      },
    };
  }

  // Yangi mijoz qo'shish
  async create(data: Partial<Customer>) {
    const customer = this.customerRepository.create(data);
    return this.customerRepository.save(customer);
  }

  // Mijozni tahrirlash
  async update(id: number, data: Partial<Customer>) {
    await this.findOne(id);
    await this.customerRepository.update(id, data);
    return this.findOne(id);
  }

  // Mijozni o'chirish
  async remove(id: number) {
    await this.findOne(id);
    await this.customerRepository.delete(id);
    return { message: "Mijoz o'chirildi" };
  }

  async upsert(data: Partial<Customer>) {
    // Telefon raqam bo'yicha mijozni qidirish
    const existing = await this.customerRepository.findOne({
      where: { phone: data.phone },
    });

    if (existing) {
      // Mavjud bo'lsa — update
      await this.customerRepository.update(existing.id, data);
      return { action: 'updated', customer: { ...existing, ...data } };
    } else {
      // Yo'q bo'lsa — create
      const customer = this.customerRepository.create(data);
      const saved = await this.customerRepository.save(customer);
      return { action: 'created', customer: saved };
    }
  }
}
