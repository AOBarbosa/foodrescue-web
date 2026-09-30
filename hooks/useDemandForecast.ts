import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { wasteRiskKeys } from '@/hooks/useWasteRisk'
import {
  getLatestDemandForecast,
  predictDemand,
} from '@/lib/api/demandForecasts'

export const demandForecastKeys = {
  all: ['demand-forecasts'] as const,
  latest: (productId: number) =>
    [...demandForecastKeys.all, 'latest', productId] as const,
}

/** `data` is `null` while the product has never been forecast. */
export function useLatestDemandForecast(productId: number) {
  return useQuery({
    queryKey: demandForecastKeys.latest(productId),
    queryFn: () => getLatestDemandForecast(productId),
  })
}

/** A new forecast is what the waste risk is assessed against. */
export function usePredictDemand(productId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => predictDemand(productId),
    onSuccess: (forecast) => {
      queryClient.setQueryData(demandForecastKeys.latest(productId), forecast)
      void queryClient.invalidateQueries({ queryKey: wasteRiskKeys.all })
    },
  })
}
