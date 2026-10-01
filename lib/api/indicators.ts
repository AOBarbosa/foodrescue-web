import type { ApiResponse } from '@/types/api'
import type {
  GetIndicatorsParams,
  WasteAndSavingsIndicatorsDTO,
} from '@/types/indicators'

import { apiClient, unwrap } from './client'

/**
 * Retrieves consolidated waste and savings indicators for the establishment (UC12).
 */
export async function getIndicators(
  params?: GetIndicatorsParams
): Promise<WasteAndSavingsIndicatorsDTO> {
  return unwrap(
    await apiClient.get<ApiResponse<WasteAndSavingsIndicatorsDTO>>(
      '/indicators',
      {
        params,
      }
    )
  )
}
