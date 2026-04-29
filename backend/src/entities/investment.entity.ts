import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type InstrumentType =
  | 'reksa_dana'
  | 'sukuk'
  | 'deposito_syariah'
  | 'saham_syariah';

export type InvestmentStatus = 'active' | 'matured' | 'liquidated';

/**
 * A single investment instrument the foundation holds. Tracks principal,
 * current value, expected return, and lifecycle status. Cash movements
 * (purchase, returns received, partial/full liquidation, mark-to-market
 * value updates) live in `investment_transactions` so we keep an
 * append-only audit of how the value of each instrument evolved.
 *
 * Money is stored as `decimal(18,2)` — TypeORM/pg returns these as
 * strings to preserve precision; convert to number only at the
 * presentation boundary, never inside arithmetic.
 */
@Entity('investments')
export class Investment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Index('IDX_investments_instrument_type')
  @Column({
    type: 'enum',
    enum: ['reksa_dana', 'sukuk', 'deposito_syariah', 'saham_syariah'],
  })
  instrumentType: InstrumentType;

  @Column({ type: 'varchar', length: 255 })
  institution: string;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  principalAmount: string;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  currentValue: string;

  @Index('IDX_investments_purchase_date')
  @Column({ type: 'date' })
  purchaseDate: string;

  @Column({ type: 'date', nullable: true })
  maturityDate: string | null;

  /** Expected return rate, % per annum. Nullable for instruments without a stated rate (e.g. equity). */
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  expectedReturnRate: string | null;

  /** Cumulative realized return so far (sum of all `return_received` txns). */
  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  actualReturnAmount: string;

  @Index('IDX_investments_status')
  @Column({
    type: 'enum',
    enum: ['active', 'matured', 'liquidated'],
    default: 'active',
  })
  status: InvestmentStatus;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  /**
   * UUID of the user who entered this record. FK to users(id) with
   * ON DELETE SET NULL — we keep the row visible if the user is later
   * deleted, just lose the attribution.
   */
  @Column({ type: 'uuid', nullable: true })
  createdBy: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

export type InvestmentTransactionType =
  | 'purchase'
  | 'return_received'
  | 'partial_liquidation'
  | 'full_liquidation'
  | 'value_update';

/**
 * Append-only journal of cash & valuation events against an Investment.
 * Application code should never UPDATE or DELETE these rows — instead,
 * insert a corrective `value_update` or `return_received` row.
 */
@Entity('investment_transactions')
export class InvestmentTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** FK to investments(id), ON DELETE CASCADE — transactions don't outlive their parent. */
  @Index('IDX_investment_tx_investment_id')
  @Column({ type: 'uuid' })
  investmentId: string;

  @Column({
    type: 'enum',
    enum: [
      'purchase',
      'return_received',
      'partial_liquidation',
      'full_liquidation',
      'value_update',
    ],
  })
  transactionType: InvestmentTransactionType;

  /**
   * Signed amount in IDR. Positive for inflows (returns received) or
   * outflows (purchase) — direction is implied by `transactionType`,
   * not by sign. `value_update` records the new fair value, not a delta.
   */
  @Column({ type: 'decimal', precision: 18, scale: 2 })
  amount: string;

  @Column({ type: 'date' })
  transactionDate: string;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  /** UUID of the user who recorded the transaction. ON DELETE SET NULL. */
  @Column({ type: 'uuid', nullable: true })
  recordedBy: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
