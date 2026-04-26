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

export type DisbursementStatus = 'pending' | 'process' | 'completed';

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
    enum: ['pending', 'process', 'completed'],
    default: 'pending',
  })
  status: DisbursementStatus;

  @Column({ nullable: true })
  proofUrl: string;

  @Column('text', { nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
