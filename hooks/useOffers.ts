import { useCallback } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  closeOffer,
  createOffer,
  listOffers,
  markOfferAsPriority,
} from '@/lib/api/offers'
import type { CreateOfferRequest, OfferDTO } from '@/types/offer'

export const offerKeys = {
  all: ['offers'] as const,
  list: () => [...offerKeys.all, 'list'] as const,
  detail: (id: number) => [...offerKeys.all, 'detail', id] as const,
}

/** Every offer of the establishment, newest first (the backend sorts them). */
export function useOffers() {
  return useQuery({ queryKey: offerKeys.list(), queryFn: listOffers })
}

/**
 * The offers of one product. The backend has no per-product route, so this
 * narrows the establishment's list instead of fetching again — the product
 * page and the offers panel share one cache entry.
 */
export function useProductOffers(productId: number) {
  return useQuery({
    queryKey: offerKeys.list(),
    queryFn: listOffers,
    select: useCallback(
      (offers: OfferDTO[]) =>
        offers.filter((offer) => offer.productId === productId),
      [productId]
    ),
  })
}

/**
 * Publishing an offer does not touch the product's stock (the units are only
 * deducted when a consumer orders), so only the offers are refetched.
 */
export function useCreateOffer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: CreateOfferRequest) => createOffer(request),
    onSuccess: (offer) => {
      queryClient.setQueryData(offerKeys.detail(offer.id), offer)
      void queryClient.invalidateQueries({ queryKey: offerKeys.list() })
    },
  })
}

/**
 * UC11: highlighting an offer only changes the offer itself — the consumer
 * listing is a separate query of a separate session, fetched already ranked by
 * the backend.
 */
export function useMarkOfferAsPriority() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => markOfferAsPriority(id),
    onSuccess: (offer) => {
      queryClient.setQueryData(offerKeys.detail(offer.id), offer)
      void queryClient.invalidateQueries({ queryKey: offerKeys.list() })
    },
  })
}

export function useCloseOffer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => closeOffer(id),
    onSuccess: (offer) => {
      queryClient.setQueryData(offerKeys.detail(offer.id), offer)
      void queryClient.invalidateQueries({ queryKey: offerKeys.list() })
    },
  })
}
