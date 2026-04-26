import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Donation } from './index';

export type ProgramStatus = 'draft' | 'active' | 'completed' | 'archived';

@Entity('programs')
export class Program {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ nullable: true })
  image: string;

  @Column({
    type: 'enum',
    enum: ['draft', 'active', 'completed', 'archived'],
    default: 'active',
  })
  status: ProgramStatus;

  @Column({ type: 'bigint', default: 0 })
  targetAmount: number;

  @Column({ type: 'bigint', default: 0 })
  collectedAmount: number;

  @Column({ nullable: true })
  startDate: Date;

  @Column({ nullable: true })
  endDate: Date;

  @Column({ nullable: true })
  category: string;

  @Column({ default: 0 })
  donorCount: number;

  @OneToMany(() => Donation, (donation) => donation.program)
  donations: Donation[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
