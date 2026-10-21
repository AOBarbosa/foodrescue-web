import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  getOfferOrder,
  listAvailableOffers,
  listOfferOrders,
  reserveOffer,
} from '@/lib/api/offerOrders'
import { describeReserveOfferError } from '@/lib/offerOrder/describe'
import type { ReserveOfferRequest } from '@/types/offerOrder'

export const offerOrderKeys = {
  all: ['offer-orders'] as const,
  availableOffers: () => [...offerOrderKeys.all, 'available-offers'] as const,
  list: () => [...offerOrderKeys.all, 'list'] as const,
  detail: (id: number) => [...offerOrderKeys.all, 'detail', id] as const,
}

export function useAvailableOffers() {
  return useQuery({
    queryKey: offerOrderKeys.availableOffers(),
    queryFn: listAvailableOffers,
  })
}

export function useOfferOrders() {
  return useQuery({
    queryKey: offerOrderKeys.list(),
    queryFn: listOfferOrders,
  })
}

export function useOfferOrder(id: number | undefined) {
  return useQuery({
    queryKey: offerOrderKeys.detail(id ?? -1),
    queryFn: () => getOfferOrder(id!),
    enabled: id !== undefined,
  })
}

/**
 * Reserving an offer decrements its `availableQuantity` (and closes the offer
 * when the last unit is taken), so the available offers and the consumer's
 * reservation list are refetched. Stale-state failures (409 concurrency
 * conflict or 422 expired/closed/insufficient units) also refetch the
 * available offers so the UI reflects the latest quantities right away.
 */
export function useReserveOffer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: ReserveOfferRequest) => reserveOffer(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: offerOrderKeys.all })
    },
    onError: (error) => {
      if (describeReserveOfferError(error)?.shouldRefetchOffers) {
        void queryClient.invalidateQueries({
          queryKey: offerOrderKeys.availableOffers(),
        })
      }
    },
  })
}
