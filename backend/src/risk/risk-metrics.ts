import type { PortfolioSummary } from '../investment/investment.service';
import type { InstrumentType } from '../entities';

/**
 * Registry of metric keys the evaluation engine knows how to compute. The
 * UI's "create threshold" dropdown should be populated from this list, and
 * the DTO uses it to reject unknown keys at the boundary.
 *
 * Adding a new metric:
 *   1. Add the key to RISK_METRIC_KEYS.
 *   2. Add a case to computeMetric().
 *   3. (Optional) document expected unit in the comment beside the key.
 */
export const RISK_METRIC_KEYS = [
  // % of total current value held in a single instrument category
  'reksa_dana_percentage',
  'sukuk_percentage',
  'deposito_syariah_percentage',
  'saham_syariah_percentage',
  // max % across all instrument categories — concentration risk
  'single_instrument_percentage',
  // total portfolio mark-to-market in IDR
  'total_exposure_idr',
  // count of active (non-matured/non-liquidated) instruments
  'active_instruments',
] as const;

export type RiskMetricKey = (typeof RISK_METRIC_KEYS)[number];

/**
 * Compute the numeric value of a metric against the current portfolio.
 * Returns `null` for unknown keys — caller should treat that as a
 * configuration error (skip evaluation, do NOT trigger alert).
 */
export function computeMetric(
  metricKey: string,
  summary: PortfolioSummary,
): number | null {
  const byType = (t: InstrumentType): number =>
    summary.allocationByType.find((a) => a.type === t)?.percentage ?? 0;

  switch (metricKey) {
    case 'reksa_dana_percentage':
      return byType('reksa_dana');
    case 'sukuk_percentage':
      return byType('sukuk');
    case 'deposito_syariah_percentage':
      return byType('deposito_syariah');
    case 'saham_syariah_percentage':
      return byType('saham_syariah');
    case 'single_instrument_percentage':
      return summary.allocationByType.reduce(
        (max, a) => (a.percentage > max ? a.percentage : max),
        0,
      );
    case 'total_exposure_idr':
      return summary.totalCurrentValue;
    case 'active_instruments':
      return summary.activeCount;
    default:
      return null;
  }
}

/** Human-readable unit for log messages. */
export function metricUnit(metricKey: string): '%' | 'IDR' | 'count' {
  if (metricKey === 'total_exposure_idr') return 'IDR';
  if (metricKey === 'active_instruments') return 'count';
  return '%';
}
