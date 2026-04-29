import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Partner } from './entities/partner.entity';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { CreatePartnerDto } from './dto/create-partner.dto';

@Injectable()
export class PartnersService {
  constructor(
    @InjectRepository(Partner)
    private partnerRepository: Repository<Partner>,
    private usersService: UsersService,
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
  async create(data: CreatePartnerDto) {
    // 1. Username mavjudligini tekshirish
    const existingUser = await this.usersService.findByUsername(data.username);
    if (existingUser)
      throw new BadRequestException('Bu username allaqachon mavjud');

    // 2. User yaratish
    const hashPassword = await bcrypt.hash(data.password, 10);
    const user = await this.usersService.create({
      username: data.username,
      password: hashPassword,
      role: 'partner',
    });

    // 3. Partner yaratish
    const partner = this.partnerRepository.create({
      full_name: data.full_name,
      phone: data.phone,
      balance: data.balance || 0,
      total_invested: data.balance || 0,
      notes: data.notes,
      user,
    });

    return this.partnerRepository.save(partner);
  }

  // Sherikni tahrirlash
  async update(id: number, data: Partial<Partner>) {
    // 1. Avval sherik borligini tekshiramiz
    const partner = await this.findOne(id);

    // 2.
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
