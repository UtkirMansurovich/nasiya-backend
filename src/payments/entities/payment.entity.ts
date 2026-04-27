import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Credit } from '../../credits/entities/credit.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Credit)
  @JoinColumn()
  credit: Credit;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: ['cash', 'card', 'transfer'],
    default: 'cash',
  })
  method: string;

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn()
  payment_date: Date;
}
