import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Owner } from './entities/owner.entity';

@Injectable()
export class OwnerService {
  constructor(
    @InjectRepository(Owner)
    private ownerRepository: Repository<Owner>,
  ) {}

  // Asosiy kishi hisobini olish (har doim 1 ta bo'ladi)
  async getBalance(): Promise<Owner> {
    let owner = await this.ownerRepository.findOne({ where: { id: 1 } });

    // Agar mavjud bo'lmasa — avtomatik yaratish
    if (!owner) {
      owner = this.ownerRepository.create({
        balance: 0,
        total_invested: 0,
        total_profit: 0,
        total_loss: 0,
      });
      await this.ownerRepository.save(owner);
    }

    return owner;
  }

  // Mablag' qo'shish
  async addBalance(amount: number, notes?: string): Promise<Owner> {
    const owner = await this.getBalance();

    await this.ownerRepository.update(owner.id, {
      balance: Number(owner.balance) + amount,
      total_invested: Number(owner.total_invested) + amount,
    });

    return this.getBalance();
  }

  // Foyda qo'shish
  async addProfit(amount: number): Promise<void> {
    const owner = await this.getBalance();

    await this.ownerRepository.update(owner.id, {
      balance: Number(owner.balance) + amount,
      total_profit: Number(owner.total_profit) + amount,
    });
  }

  // Zarar qo'shish
  async addLoss(amount: number): Promise<void> {
    const owner = await this.getBalance();

    await this.ownerRepository.update(owner.id, {
      balance: Number(owner.balance) - amount,
      total_loss: Number(owner.total_loss) + amount,
    });
  }

  // Nasiya berishda balansdan ayirish
  async deductBalance(amount: number): Promise<void> {
    const owner = await this.getBalance();

    if (Number(owner.balance) < amount) {
      throw new Error(
        `Asosiy kishi balansida yetarli mablag' yo'q! Balans: ${owner.balance} so'm`,
      );
    }

    await this.ownerRepository.update(owner.id, {
      balance: Number(owner.balance) - amount,
    });
  }
}
