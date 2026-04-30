import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Credit } from '../../credits/entities/credit.entity';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  full_name!: string;

  @Column()
  phone!: string;

  @Column({ nullable: true })
  phone2!: string;

  @Column({ nullable: true })
  address!: string;

  @Column({ nullable: true })
  passport_series!: string;

  @Column({ nullable: true })
  passport_number!: string;

  @Column({ nullable: true })
  passport_issued_by!: string;

  @Column({ nullable: true })
  passport_issued_date!: string;

  @Column({ nullable: true })
  referred_by!: string;

  @Column({ nullable: true })
  workplace!: string;

  @Column({ nullable: true })
  guarantor_name!: string;

  @Column({ nullable: true })
  guarantor_phone!: string;

  @CreateDateColumn()
  created_at!: Date;

  @OneToMany(() => Credit, (credit) => credit.customer)
  credits!: Credit[];
}
