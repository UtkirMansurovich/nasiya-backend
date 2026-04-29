import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Partner } from '../../partners/entities/partner.entity';

@Entity('investments')
export class Investment {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Partner)
  @JoinColumn()
  partner!: Partner;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount!: number;

  @Column({ nullable: true })
  notes!: string;

  @CreateDateColumn()
  created_at!: Date;
}
