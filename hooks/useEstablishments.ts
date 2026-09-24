import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import {
  deleteEstablishment,
  getEstablishment,
  listEstablishments,
  loginEstablishment,
  registerEstablishment,
  updateEstablishment,
} from "@/lib/api/establishments";
import { clearSession, setSession, updateSession } from "@/lib/auth/session";
import type {
  EstablishmentAuthResponse,
  LoginRequest,
  RegisterEstablishmentRequest,
  UpdateEstablishmentRequest,
} from "@/types/establishment";

export const establishmentKeys = {
  all: ["establishments"] as const,
  list: () => [...establishmentKeys.all, "list"] as const,
  detail: (id: number) => [...establishmentKeys.all, "detail", id] as const,
};

/** Starts a fresh session: nothing cached for a previous account may leak into it. */
function startSession(queryClient: QueryClient, { establishment, token }: EstablishmentAuthResponse) {
  queryClient.clear();
  setSession(token, { role: "ESTABLISHMENT", id: establishment.id, name: establishment.name });
  queryClient.setQueryData(establishmentKeys.detail(establishment.id), establishment);
}

export function useEstablishments() {
  return useQuery({ queryKey: establishmentKeys.list(), queryFn: listEstablishments });
}

export function useEstablishment(id: number | undefined) {
  return useQuery({
    queryKey: establishmentKeys.detail(id ?? -1),
    queryFn: () => getEstablishment(id!),
    enabled: id !== undefined,
  });
}

export function useRegisterEstablishment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: RegisterEstablishmentRequest) => registerEstablishment(request),
    onSuccess: (response) => startSession(queryClient, response),
  });
}

export function useLoginEstablishment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: LoginRequest) => loginEstablishment(request),
    onSuccess: (response) => startSession(queryClient, response),
  });
}

export function useUpdateEstablishment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: UpdateEstablishmentRequest }) =>
      updateEstablishment(id, request),
    onSuccess: (establishment) => {
      queryClient.setQueryData(establishmentKeys.detail(establishment.id), establishment);
      void queryClient.invalidateQueries({ queryKey: establishmentKeys.list() });
      updateSession({ name: establishment.name });
    },
  });
}

export function useDeleteEstablishment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteEstablishment(id),
    onSuccess: () => {
      clearSession();
      queryClient.clear();
    },
  });
}
