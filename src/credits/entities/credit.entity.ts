import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';
import { Partner } from '../../partners/entities/partner.entity';

@Entity('credits')
export class Credit {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Customer)
  @JoinColumn()
  customer: Customer;

  @ManyToOne(() => Partner, { nullable: true })
  @JoinColumn()
  partner: Partner;

  @Column()
  product_name: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  cost_price: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 30 })
  markup_percent: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  total_debt: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  paid_amount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  remaining_debt: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  daily_payment: number;

  @Column({ nullable: true })
  notes: string;

  @Column({
    type: 'enum',
    enum: ['active', 'completed', 'defaulted'],
    default: 'active',
  })
  status: string;

  @CreateDateColumn()
  start_date: Date;
}
