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
import { Investment } from '../investments/entities/investment.entity';
import { Credit } from 'src/credits/entities/credit.entity';

@Injectable()
export class PartnersService {
  constructor(
    @InjectRepository(Partner)
    private partnerRepository: Repository<Partner>,
    @InjectRepository(Investment)
    private investmentRepository: Repository<Investment>,
    @InjectRepository(Credit)
    private creditRepository: Repository<Credit>,
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

    const savedPartner = await this.partnerRepository.save(partner);

    // Boshlang'ich investitsiyani saqlash
    if (data.balance && data.balance > 0) {
      const investment = this.investmentRepository.create({
        partner: savedPartner,
        amount: data.balance,
        notes: "Boshlang'ich investitsiya",
      });
      await this.investmentRepository.save(investment);
    }

    return savedPartner;
  }

  // // Sherikni tahrirlash
  // async update(id: number, data: Partial<Partner>) {
  //   // 1. Avval sherik borligini tekshiramiz
  //   const partner = await this.findOne(id);

  //   // 2.
  //   await this.findOne(id);
  //   await this.partnerRepository.update(id, data);
  //   return this.findOne(id);
  // }
  // 1. Sherikni shaxsiy ma'lumotlarini tahrirlash (Ism, telefon, balans);
  async update(id: number, data: Partial<Partner>) {
    await this.findOne(id);

    const partnerData = { ...data };
    delete partnerData.user; // User obyektini bazaga yubormaslik uchun o'chirib tashlaymiz

    // Agar partnerData bo'sh bo'lmasa yangilaymiz
    if (Object.keys(partnerData).length > 0) {
      await this.partnerRepository.update(id, partnerData);
    }
    return this.findOne(id);
  }
  // 2. Sherikning login va parolini tahrirlash
  async updateAccount(
    id: number,
    accountData: { username?: string; password?: string },
  ) {
    const partner = await this.findOne(id);
    const userId = partner.user.id;

    const updateFields: Partial<CreatePartnerDto> = {};

    if (accountData.username) {
      // Username bandligini tekshirish
      const existingUser = await this.usersService.findByUsername(
        accountData.username,
      );
      if (existingUser && existingUser.id !== userId) {
        throw new BadRequestException('Bu username allaqachon mavjud');
      }
      updateFields.username = accountData.username;
    }
    if (accountData.password) {
      updateFields.password = await bcrypt.hash(accountData.password, 10);
    }

    // UserService-da update metodini ishlatamiz (pastda uni ham qo'shamiz)
    await this.usersService.update(userId, updateFields);
    return { message: "Hisob ma'lumotlari yangilandi" };
  }

  // Sherikni o'chirish
  async remove(id: number) {
    await this.findOne(id);

    // Aktiv nasiyalar bormi tekshirish
    const activeCredits = await this.creditRepository.find({
      where: {
        partner: { id },
        status: 'active',
      },
    });

    if (activeCredits.length > 0) {
      throw new BadRequestException(
        `Sherikni o'chirib bo'lmaydi, ${activeCredits.length} ta aktiv nasiya mavjud. Avval barcha nasiyalar yopilishi kerak!`,
      );
    }

    // Aktiv nisiya yo'q - o'chirish mumkin
    await this.investmentRepository.delete({ partner: { id } });
    await this.partnerRepository.delete(id);

    return { message: "Sherik muvaffaqiyatli o'chirildi" };
  }
}
