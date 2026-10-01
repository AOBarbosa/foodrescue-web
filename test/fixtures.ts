import { AppError, type AppErrorCode } from '@/lib/api/errors'
import type { ApiSubError } from '@/types/api'
import type { DemandForecastDTO } from '@/types/demandForecast'
import type { DiscountRecommendationDTO } from '@/types/discountRecommendation'
import type { EstablishmentDTO } from '@/types/establishment'
import type { WasteAndSavingsIndicatorsDTO } from '@/types/indicators'
import type { ProductDTO } from '@/types/product'
import type { SaleDTO } from '@/types/sale'
import type { WasteRiskDTO } from '@/types/wasteRisk'

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

export const wasteRisk: WasteRiskDTO = {
  productId: 10,
  productName: 'Pão de queijo',
  stockQuantity: 12,
  predictedQuantity: 3,
  expectedSurplus: 9,
  riskPercentage: 75,
  riskThreshold: 70,
  atRisk: true,
  forecastId: 7,
  forecastCalculatedAt: '2026-09-26T14:00:00',
}

export const discountRecommendation: DiscountRecommendationDTO = {
  id: 30,
  productId: product.id,
  productName: product.name,
  type: 'DISCOUNT',
  suggestedPercentage: 30,
  status: 'PENDING',
  originalPrice: 9.9,
  currentPrice: 9.9,
  priceWithDiscount: 6.93,
  createdAt: '2026-09-26T15:00:00',
  expiresAt: '2026-09-27T15:00:00',
  respondedAt: null,
}

export const indicators: WasteAndSavingsIndicatorsDTO = {
  period: {
    startDate: '2026-09-01',
    endDate: '2026-09-30',
  },
  wasteAvoidedUnits: 45,
  recoveredRevenue: 382.5,
  acceptedRecommendations: 12,
  refusedRecommendations: 3,
  adjustedRecommendations: 2,
  comparisonPeriod: {
    period: {
      startDate: '2026-08-02',
      endDate: '2026-08-31',
    },
    wasteAvoidedUnits: 30,
    recoveredRevenue: 250.0,
    acceptedRecommendations: 8,
    refusedRecommendations: 4,
    adjustedRecommendations: 1,
    comparisonPeriod: null,
  },
}
