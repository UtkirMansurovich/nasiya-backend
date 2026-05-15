import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('owner_balance')
export class Owner {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  balance!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  total_invested!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  total_profit!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  total_loss!: number;

  @UpdateDateColumn()
  updated_at!: Date;
}
