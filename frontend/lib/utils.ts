import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const rupiahFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

export function formatRupiah(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return rupiahFormatter.format(0)
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) return rupiahFormatter.format(0)
  return rupiahFormatter.format(n)
}
