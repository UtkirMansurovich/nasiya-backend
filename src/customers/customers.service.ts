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
  async findAll() {
    return this.customerRepository.find();
  }

  // Bitta mijozni olish
  async findOne(id: number) {
    const customer = await this.customerRepository.findOne({ where: { id } });
    if (!customer) throw new NotFoundException('Mijoz topilmadi');
    return customer;
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
}
