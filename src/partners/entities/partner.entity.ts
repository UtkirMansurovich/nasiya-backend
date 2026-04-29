import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('partners')
export class Partner {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(() => User)
  @JoinColumn()
  user!: User;

  @Column()
  full_name!: string;

  @Column({ nullable: true })
  phone!: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  balance!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  total_invested!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  total_profit!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  total_loss!: number;

  @Column({ nullable: true })
  notes!: string;

  @CreateDateColumn()
  created_at!: Date;
}
