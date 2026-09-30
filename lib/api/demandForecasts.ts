import type { ApiResponse } from '@/types/api'
import type { DemandForecastDTO } from '@/types/demandForecast'

import { apiClient, unwrap } from './client'
import { AppError } from './errors'

/*
 * UC05. Both routes require the ESTABLISHMENT role and only work for the
 * authenticated establishment's own products.
 */

/**
 * Calculates and records a new forecast. With the AI provider on, this can
 * take several seconds. Fails with 422 when the product lacks sales history.
 */
export async function predictDemand(
  productId: number
): Promise<DemandForecastDTO> {
  return unwrap(
    await apiClient.post<ApiResponse<DemandForecastDTO>>(
      `/products/${productId}/demand-forecast`
    )
  )
}

/**
 * Latest recorded forecast, or `null` when the product was never forecast
 * (the backend answers that with 404, the same as an unknown product).
 */
export async function getLatestDemandForecast(
  productId: number
): Promise<DemandForecastDTO | null> {
  try {
    return unwrap(
      await apiClient.get<ApiResponse<DemandForecastDTO>>(
        `/products/${productId}/demand-forecast/latest`
      )
    )
  } catch (error) {
    if (error instanceof AppError && error.status === 404) return null
    throw error
  }
}
