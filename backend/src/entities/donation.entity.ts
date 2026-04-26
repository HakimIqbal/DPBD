import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Program } from './program.entity';

export type PaymentMethod =
  | 'virtual_account'
  | 'qris'
  | 'credit_card'
  | 'bank_transfer';
export type DonationStatus = 'pending' | 'completed' | 'failed' | 'refunded';

@Entity('donations')
export class Donation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @ManyToOne(() => User, (user) => user.donations)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('uuid')
  programId: string;

  @ManyToOne(() => Program, (program) => program.donations)
  @JoinColumn({ name: 'programId' })
  program: Program;

  @Column({ type: 'bigint' })
  amount: number;

  @Column({
    type: 'enum',
    enum: ['virtual_account', 'qris', 'credit_card', 'bank_transfer'],
    default: 'virtual_account',
  })
  paymentMethod: PaymentMethod;

  @Column({
    type: 'enum',
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
  })
  status: DonationStatus;

  @Column({ nullable: true })
  proofUrl: string;

  @Column({ default: false })
  isAnonymous: boolean;

  @Column({ nullable: true })
  externalId: string; // Reference dari payment gateway (Midtrans, etc)

  @Column({ nullable: true })
  failureReason: string;

  @Column({ type: 'bigint', nullable: true })
  refundedAmount: number | null;

  @Column({ type: 'text', nullable: true })
  refundReason: string | null;

  @Column({ type: 'timestamp', nullable: true })
  refundedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  nextReminderAt: Date | null;

  @Column({ default: false })
  reminderSent: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;
}
