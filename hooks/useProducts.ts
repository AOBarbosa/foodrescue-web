import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { offerKeys } from '@/hooks/useOffers'
import { wasteRiskKeys } from '@/hooks/useWasteRisk'
import {
  createProduct,
  getProduct,
  listProducts,
  updateInventory,
} from '@/lib/api/products'
import type {
  CreateProductRequest,
  UpdateInventoryRequest,
} from '@/types/product'

export const productKeys = {
  all: ['products'] as const,
  list: () => [...productKeys.all, 'list'] as const,
  detail: (id: number) => [...productKeys.all, 'detail', id] as const,
}

export function useProducts() {
  return useQuery({ queryKey: productKeys.list(), queryFn: listProducts })
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => getProduct(id),
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: CreateProductRequest) => createProduct(request),
    onSuccess: (product) => {
      queryClient.setQueryData(productKeys.detail(product.id), product)
      void queryClient.invalidateQueries({ queryKey: productKeys.list() })
    },
  })
}

/**
 * The new stock changes the product's waste risk too, and a stock set to zero
 * closes the product's offers on the backend (UC08).
 */
export function useUpdateInventory(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: UpdateInventoryRequest) =>
      updateInventory(id, request),
    onSuccess: ({ product }) => {
      queryClient.setQueryData(productKeys.detail(product.id), product)
      void queryClient.invalidateQueries({ queryKey: productKeys.list() })
      void queryClient.invalidateQueries({ queryKey: wasteRiskKeys.all })
      void queryClient.invalidateQueries({ queryKey: offerKeys.list() })
    },
  })
}
