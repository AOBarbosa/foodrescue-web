import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createProduct, getProduct, listProducts, updateInventory } from "@/lib/api/products";
import type { CreateProductRequest, UpdateInventoryRequest } from "@/types/product";

export const productKeys = {
  all: ["products"] as const,
  list: () => [...productKeys.all, "list"] as const,
  detail: (id: number) => [...productKeys.all, "detail", id] as const,
};

export function useProducts() {
  return useQuery({ queryKey: productKeys.list(), queryFn: listProducts });
}

export function useProduct(id: number) {
  return useQuery({ queryKey: productKeys.detail(id), queryFn: () => getProduct(id) });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateProductRequest) => createProduct(request),
    onSuccess: (product) => {
      queryClient.setQueryData(productKeys.detail(product.id), product);
      void queryClient.invalidateQueries({ queryKey: productKeys.list() });
    },
  });
}

export function useUpdateInventory(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: UpdateInventoryRequest) => updateInventory(id, request),
    onSuccess: ({ product }) => {
      queryClient.setQueryData(productKeys.detail(product.id), product);
      void queryClient.invalidateQueries({ queryKey: productKeys.list() });
    },
  });
}
