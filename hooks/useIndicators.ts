import { useQuery } from '@tanstack/react-query'

import { getIndicators } from '@/lib/api/indicators'
import type { GetIndicatorsParams } from '@/types/indicators'

export const indicatorKeys = {
  all: ['indicators'] as const,
  list: (params?: GetIndicatorsParams) =>
    [...indicatorKeys.all, params] as const,
}

export function useIndicators(params?: GetIndicatorsParams) {
  return useQuery({
    queryKey: indicatorKeys.list(params),
    queryFn: () => getIndicators(params),
  })
}
