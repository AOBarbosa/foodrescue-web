import { useQuery } from '@tanstack/react-query'

import { getProductWasteRisk, listWasteRisks } from '@/lib/api/wasteRisks'

/**
 * The risk depends on the forecast and the current stock, so forecasting,
 * selling and updating the inventory invalidate `wasteRiskKeys.all`.
 */
export const wasteRiskKeys = {
  all: ['waste-risks'] as const,
  list: (atRiskOnly: boolean) =>
    [...wasteRiskKeys.all, 'list', { atRiskOnly }] as const,
  product: (productId: number) =>
    [...wasteRiskKeys.all, 'product', productId] as const,
}

export function useWasteRisks(atRiskOnly: boolean) {
  return useQuery({
    queryKey: wasteRiskKeys.list(atRiskOnly),
    queryFn: () => listWasteRisks({ atRiskOnly }),
  })
}

/** `data` is `null` while the product has never been forecast. */
export function useProductWasteRisk(productId: number) {
  return useQuery({
    queryKey: wasteRiskKeys.product(productId),
    queryFn: () => getProductWasteRisk(productId),
  })
}
