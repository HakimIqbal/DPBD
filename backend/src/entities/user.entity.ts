import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Donation } from './index';

export type UserRole =
  | 'admin'
  | 'editor'
  | 'finance'
  | 'personal'
  | 'company'
  | 'ceo'
  | 'cfo'
  | 'investment_manager'
  | 'risk_manager'
  | 'ethic_committee'
  | 'audit_independent'
  | 'dewan_pengawas'
  | 'dewan_pembina'
  | 'partnership_onboarding';
export type UserStatus = 'active' | 'suspended' | 'deleted';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: [
      'admin',
      'editor',
      'finance',
      'personal',
      'company',
      'ceo',
      'cfo',
      'investment_manager',
      'risk_manager',
      'ethic_committee',
      'audit_independent',
      'dewan_pengawas',
      'dewan_pembina',
      'partnership_onboarding',
    ],
    default: 'personal',
  })
  role: UserRole;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  country: string;

  @Column({
    type: 'enum',
    enum: ['active', 'suspended', 'deleted'],
    default: 'active',
  })
  status: UserStatus;

  // Company-specific fields
  @Column({ nullable: true })
  companyName: string;

  @Column({ nullable: true })
  npwp: string;

  @Column({ nullable: true })
  picName: string;

  @Column({ nullable: true })
  companyAddress: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  website: string;

  @Column({ type: 'varchar', default: 'Indonesia' })
  companyCountry: string;

  @Column({
    type: 'enum',
    enum: ['Technology', 'Finance', 'Retail', 'Manufacturing', 'Other'],
    nullable: true,
  })
  industry: string;

  @Column({ type: 'bigint', default: 0 })
  totalDonation: number;

  @Column({ nullable: true })
  lastDonation: Date;

  // Profile fields for individual donors
  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  zipCode: string;

  // Notification preferences
  @Column({ default: true })
  emailNotifications: boolean;

  @Column({ default: false })
  smsNotifications: boolean;

  @Column({ default: true })
  monthlyReports: boolean;

  @Column({ default: false })
  publicProfile: boolean;

  @Column({ default: true })
  allowCommunications: boolean;

  @Column({ type: 'varchar', default: 'id' })
  preferredLanguage: string;

  // Activity tracking
  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Donation, (donation) => donation.user)
  donations: Donation[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
