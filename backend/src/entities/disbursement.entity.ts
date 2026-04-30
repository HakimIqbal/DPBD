import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Program } from './program.entity';
import { User } from './user.entity';

/**
 * Lifecycle:
 *   pending  → finance submitted; awaiting CFO review
 *   approved → CFO approved; ready for processing
 *   rejected → CFO rejected with rejectionReason
 *   process  → operations actively disbursing the funds
 *   completed → funds disbursed, proofUrl attached
 *
 * 'approved' and 'rejected' were added in migration
 * 1777450000000-ExtendDisbursements; older rows may still be in the
 * pre-existing pending/process/completed states.
 */
export type DisbursementStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'process'
  | 'completed';

@Entity('disbursements')
export class Disbursement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  programId: string;

  @ManyToOne(() => Program)
  @JoinColumn({ name: 'programId' })
  program: Program;

  @Column()
  recipient: string;

  @Column({ type: 'bigint' })
  amount: number;

  @Column()
  date: Date;

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'rejected', 'process', 'completed'],
    default: 'pending',
  })
  status: DisbursementStatus;

  @Column({ nullable: true })
  proofUrl: string;

  @Column('text', { nullable: true })
  description: string;

  // --- Review workflow (added in 1777450000000) -----------------------

  @Column({ type: 'uuid', nullable: true })
  requestedBy: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'requestedBy' })
  requestedByUser: User | null;

  @Column({ type: 'timestamp', nullable: true })
  requestedAt: Date | null;

  @Column({ type: 'uuid', nullable: true })
  reviewedBy: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reviewedBy' })
  reviewedByUser: User | null;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt: Date | null;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
