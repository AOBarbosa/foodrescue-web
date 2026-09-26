import type { ApiResponse } from "@/types/api";
import type {
  EstablishmentAuthResponse,
  EstablishmentDTO,
  LoginRequest,
  RegisterEstablishmentRequest,
  UpdateEstablishmentRequest,
} from "@/types/establishment";
import { apiClient, unwrap } from "./client";

export async function registerEstablishment(
  request: RegisterEstablishmentRequest,
): Promise<EstablishmentAuthResponse> {
  return unwrap(await apiClient.post<ApiResponse<EstablishmentAuthResponse>>("/establishments", request));
}

export async function loginEstablishment(request: LoginRequest): Promise<EstablishmentAuthResponse> {
  return unwrap(
    await apiClient.post<ApiResponse<EstablishmentAuthResponse>>("/establishments/login", request),
  );
}

export async function listEstablishments(): Promise<EstablishmentDTO[]> {
  return unwrap(await apiClient.get<ApiResponse<EstablishmentDTO[]>>("/establishments"));
}

export async function getEstablishment(id: number): Promise<EstablishmentDTO> {
  return unwrap(await apiClient.get<ApiResponse<EstablishmentDTO>>(`/establishments/${id}`));
}

export async function updateEstablishment(
  id: number,
  request: UpdateEstablishmentRequest,
): Promise<EstablishmentDTO> {
  return unwrap(await apiClient.put<ApiResponse<EstablishmentDTO>>(`/establishments/${id}`, request));
}

/** Soft delete; the backend answers `204 No Content`. */
export async function deleteEstablishment(id: number): Promise<void> {
  await apiClient.delete(`/establishments/${id}`);
}
