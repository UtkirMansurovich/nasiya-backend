import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Partner } from './entities/partner.entity';

@Injectable()
export class PartnersService {
  constructor(
    @InjectRepository(Partner)
    private partnerRepository: Repository<Partner>,
  ) {}

  // Barcha sheriklar
  async findAll() {
    return this.partnerRepository.find({ relations: ['user'] });
  }

  // Bitta sherik
  async findOne(id: number) {
    const partner = await this.partnerRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!partner) throw new NotFoundException('Sherik topilmadi');
    return partner;
  }

  // Yangi sherik qo'shish
  async create(data: Partial<Partner>) {
    const partner = this.partnerRepository.create(data);
    return this.partnerRepository.save(partner);
  }

  // Sherikni tahrirlash
  async update(id: number, data: Partial<Partner>) {
    await this.findOne(id);
    await this.partnerRepository.update(id, data);
    return this.findOne(id);
  }

  // Sherikni o'chirish
  async remove(id: number) {
    await this.findOne(id);
    await this.partnerRepository.delete(id);
    return { message: "Sherik o'chirildi" };
  }
}
