import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { productKeys } from '@/hooks/useProducts'
import { listSales, registerSale } from '@/lib/api/sales'
import type { RegisterSaleRequest, SalePeriod } from '@/types/sale'

export const saleKeys = {
  all: ['sales'] as const,
  history: (productId: number, period: SalePeriod) =>
    [...saleKeys.all, 'history', productId, period] as const,
}

export function useSaleHistory(productId: number, period: SalePeriod) {
  return useQuery({
    queryKey: saleKeys.history(productId, period),
    queryFn: () => listSales({ productId, ...period }),
  })
}

/**
 * Registering a sale deducts the sold quantity from the product's stock, so
 * the cached product (detail and list) is refetched along with the history.
 */
export function useRegisterSale(productId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: RegisterSaleRequest) => registerSale(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: saleKeys.all })
      void queryClient.invalidateQueries({
        queryKey: productKeys.detail(productId),
      })
      void queryClient.invalidateQueries({ queryKey: productKeys.list() })
    },
  })
}
