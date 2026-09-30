import { AppError, type AppErrorCode } from '@/lib/api/errors'
import type { ApiSubError } from '@/types/api'
import type { DemandForecastDTO } from '@/types/demandForecast'
import type { EstablishmentDTO } from '@/types/establishment'
import type { ProductDTO } from '@/types/product'
import type { SaleDTO } from '@/types/sale'

export const establishment: EstablishmentDTO = {
  id: 1,
  name: 'Padaria Pão Quente',
  cnpj: '11222333000181',
  address: 'Rua das Flores, 123 - Natal/RN',
  category: 'BAKERY',
  email: 'contato@paoquente.com',
  password: null,
}

export const product: ProductDTO = {
  id: 10,
  name: 'Pão de forma integral',
  category: 'Padaria',
  originalPrice: 9.9,
  currentPrice: 9.9,
  photoUrl: null,
  stockQuantity: 12,
  expirationDate: '2026-10-01',
  establishmentId: 1,
  modificationDate: '2026-09-20T10:00:00',
}

export const sale: SaleDTO = {
  id: 100,
  productId: product.id,
  quantity: 3,
  unitPrice: 9.9,
  totalPrice: 29.7,
  soldAt: '2026-09-23T10:30:00',
  creationDate: '2026-09-23T10:30:02',
}

export function apiError(
  status: number,
  code: AppErrorCode,
  subErrors?: ApiSubError[],
  message = 'error'
): AppError {
  return new AppError({ status, code, subErrors, message })
}

export const demandForecast: DemandForecastDTO = {
  id: 7,
  productId: 10,
  predictedQuantity: 8,
  stockQuantity: 12,
  confidence: 'HIGH',
  sampleSize: 23,
  source: 'weekday-hourly-average',
  rationale: null,
  calculatedAt: '2026-09-26T14:00:00',
  forecastUntil: '2026-09-26T22:00:00',
}
