import type { ApiResponse } from '@/types/api'
import type { WasteRiskDTO } from '@/types/wasteRisk'

import { apiClient, unwrap } from './client'
import { AppError } from './errors'

/*
 * UC06. Both routes require the ESTABLISHMENT role. The risk is derived on
 * read from the latest demand forecast (UC05) and the current stock, so every
 * sale or inventory update is reflected the next time it is fetched.
 */

/**
 * The establishment's forecast products, riskiest first. Products that were
 * never forecast are left out.
 */
export async function listWasteRisks({
  atRiskOnly,
}: {
  atRiskOnly: boolean
}): Promise<WasteRiskDTO[]> {
  return unwrap(
    await apiClient.get<ApiResponse<WasteRiskDTO[]>>('/waste-risks', {
      params: { atRiskOnly },
    })
  )
}

/**
 * Waste risk of one product, or `null` when it was never forecast (the
 * backend answers that with 404, the same as an unknown product).
 */
export async function getProductWasteRisk(
  productId: number
): Promise<WasteRiskDTO | null> {
  try {
    return unwrap(
      await apiClient.get<ApiResponse<WasteRiskDTO>>(
        `/products/${productId}/waste-risk`
      )
    )
  } catch (error) {
    if (error instanceof AppError && error.status === 404) return null
    throw error
  }
}
