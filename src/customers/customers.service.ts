import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CustomerStats } from './interfaces';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  async findAllWithoutPagination(): Promise<Customer[]> {
    return await this.customerRepository.find({
      order: { full_name: 'ASC' },
    });
  }

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

  async findOne(id: number) {
    const customer = await this.customerRepository.findOne({
      where: { id },
      relations: ['credits', 'credits.payments'],
    });

    if (!customer) throw new NotFoundException('Mijoz topilmadi');
    return this.calculateStats(customer);
  }

  private calculateStats(customer: Customer): any {
    const credits = customer.credits || [];
    let jami_qarz = 0;
    let jami_qarz_va_foyda = 0;
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
          if (!oxirgi_sana || pDate > oxirgi_sana) oxirgi_sana = pDate;
        });
      }
    });

    const ustama_foiz = credits.length > 0 ? total_markup_percent / credits.length : 0;
    const foyda = jami_qarz_va_foyda - jami_qarz;

    let status = 'none';
    if (credits.length > 0) {
      if (credits.some((c) => c.status === 'defaulted')) status = 'defaulted';
      else if (credits.some((c) => c.status === 'active')) status = 'active';
      else status = 'completed';
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

  async create(data: Partial<Customer>) {
    const customer = this.customerRepository.create(data);
    return this.customerRepository.save(customer);
  }

  async update(id: number, data: Partial<Customer>) {
    await this.customerRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.customerRepository.delete(id);
    return { message: "Mijoz o'chirildi" };
  }

  async upsert(data: Partial<Customer>) {
    const existing = await this.customerRepository.findOne({ where: { phone: data.phone } });
    if (existing) {
      await this.customerRepository.update(existing.id, data);
      return { action: 'updated', customer: { ...existing, ...data } };
    }
    const customer = this.customerRepository.create(data);
    const saved = await this.customerRepository.save(customer);
    return { action: 'created', customer: saved };
  }

  async importBulk(customers: Partial<Customer>[]) {
    let created = 0;
    let updated = 0;
    for (const data of customers) {
      const res = await this.upsert(data);
      if (res.action === 'created') created++; else updated++;
    }
    return { created, updated };
  }

  async findByPhone(phone: string) {
    return await this.customerRepository.findOne({ where: { phone } });
  }
}
