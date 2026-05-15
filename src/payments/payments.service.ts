import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { Credit } from '../credits/entities/credit.entity';
import { CreatePaymentDto, ImportPaymentDto } from './dto/payment.dto';

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

  // Mijoz bo'yicha to'lovlar
  async findByCustomer(customerId: number) {
    return this.paymentRepository
      .createQueryBuilder('payment')
      .innerJoinAndSelect('payment.credit', 'credit')
      .innerJoin('credit.customer', 'customer')
      .where('customer.id = :customerId', { customerId })
      .orderBy('payment.payment_date', 'DESC')
      .getMany();
  }

  // Yangi to'lov qo'shish
  async create(data: CreatePaymentDto) {
    const credit = await this.creditRepository.findOne({
      where: { id: data.creditId },
    });
    if (!credit) throw new NotFoundException('Nasiya topilmadi');

    // To'lovni saqlash
    const payment = this.paymentRepository.create({
      credit: { id: data.creditId },
      amount: data.amount,
      method: data.method || 'cash',
      notes: data.notes,
      payment_date: data.payment_date || new Date(), // ← qo'shildi
    });
    await this.paymentRepository.save(payment);

    // Nasiya qoldiq summasini yangilash
    const paid_amount = Number(credit.paid_amount) + Number(data.amount);
    const remaining_debt = Number(credit.total_debt) - paid_amount;
    const status = remaining_debt <= 0 ? 'completed' : 'active';

    await this.creditRepository.update(credit.id, {
      paid_amount,
      remaining_debt: Math.max(0, remaining_debt), // ← manfiy bo'lmasin
      status,
    });

    return payment;
  }

  // Excel orqali ommaviy yuklash
  async importBulk(paymentsData: ImportPaymentDto[], dates: string[]) {
    let created = 0;
    const errors: {
      row: number;
      phone: string;
      date: string;
      message: string;
    }[] = [];

    for (let i = 0; i < paymentsData.length; i++) {
      const data = paymentsData[i];
      const rawPhone = String(data.customer_phone || '').trim();
      const searchPhone = rawPhone.replace(/\D/g, '');

      if (!searchPhone) {
        errors.push({
          row: i + 2,
          phone: rawPhone,
          date: '',
          message: 'Telefon raqami kiritilmagan',
        });
        continue;
      }

      // Telefon va mahsulot bo'yicha aktiv nasiyani topish
      const credit = await this.creditRepository
        .createQueryBuilder('credit')
        .leftJoin('credit.customer', 'customer')
        .where(
          "REPLACE(REPLACE(customer.phone, '+', ''), ' ', '') LIKE :phone",
          {
            phone: `%${searchPhone}%`,
          },
        )
        .andWhere('credit.status = :status', { status: 'active' })
        .andWhere('credit.product_name = :product', {
          // ← ILIKE o'rniga = (aniq moslik)
          product: data.product_name,
        })
        .getOne();

      if (!credit) {
        errors.push({
          row: i + 2,
          phone: rawPhone,
          date: '',
          message: `"${data.product_name}" mahsuloti bo'yicha aktiv nasiya topilmadi`,
        });
        continue;
      }

      // Har bir kun uchun to'lov saqlash
      for (const date of dates) {
        const amount = Number(data[date] || 0);

        // 0 bo'lsa — to'lov yo'q, o'tkazib yuboramiz
        if (amount === 0) continue;

        try {
          await this.create({
            creditId: credit.id,
            amount,
            method: data.method || 'cash',
            notes: data.notes,
            payment_date: date,
          });
          created++;
        } catch (err: unknown) {
          const errorMessage =
            err instanceof Error ? err.message : 'Xatolik yuz berdi';
          errors.push({
            row: i + 2,
            phone: rawPhone,
            date,
            message: errorMessage,
          });
        }
      }
    }

    return { created, errors };
  }

  // To'lovni o'chirish
  async remove(id: number) {
    await this.findOne(id);
    await this.paymentRepository.delete(id);
    return { message: "To'lov o'chirildi" };
  }
}
