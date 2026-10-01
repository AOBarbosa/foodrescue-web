import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { productKeys } from '@/hooks/useProducts'
import {
  listPendingRecommendations,
  listProductRecommendations,
  recommendDiscount,
  respondToRecommendation,
} from '@/lib/api/discountRecommendations'
import type { RespondToRecommendationRequest } from '@/types/discountRecommendation'

export const discountRecommendationKeys = {
  all: ['discount-recommendations'] as const,
  pending: () => [...discountRecommendationKeys.all, 'pending'] as const,
  product: (productId: number) =>
    [...discountRecommendationKeys.all, 'product', productId] as const,
}

export function useProductRecommendations(productId: number) {
  return useQuery({
    queryKey: discountRecommendationKeys.product(productId),
    queryFn: () => listProductRecommendations(productId),
  })
}

export function usePendingRecommendations() {
  return useQuery({
    queryKey: discountRecommendationKeys.pending(),
    queryFn: listPendingRecommendations,
  })
}

/** The new recommendation shows up both on the product and on the panel. */
export function useRecommendDiscount(productId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => recommendDiscount(productId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: discountRecommendationKeys.all,
      })
    },
  })
}

/**
 * Accepting or adjusting updates the product's current price on the backend,
 * so the cached product (detail and list) is refetched along with the
 * recommendations. Refusing changes no price, but the answered recommendation
 * still leaves the pending list.
 */
export function useRespondToRecommendation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      request,
    }: {
      id: number
      request: RespondToRecommendationRequest
    }) => respondToRecommendation(id, request),
    onSuccess: (recommendation) => {
      void queryClient.invalidateQueries({
        queryKey: discountRecommendationKeys.all,
      })
      void queryClient.invalidateQueries({
        queryKey: productKeys.detail(recommendation.productId),
      })
      void queryClient.invalidateQueries({ queryKey: productKeys.list() })
    },
  })
}
