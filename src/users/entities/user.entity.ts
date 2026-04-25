/* eslint-disable prettier/prettier */
// eslint-disable-next-line prettier/prettier
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ default: 'cashier' })
  role: string;

  @CreateDateColumn()
  createdAt: Date;
}