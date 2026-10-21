import type { ApiResponse } from '@/types/api'
import type {
  ConsumerAuthResponse,
  RegisterConsumerRequest,
} from '@/types/consumer'
import type { LoginRequest } from '@/types/establishment'

import { apiClient, unwrap } from './client'

export async function registerConsumer(
  request: RegisterConsumerRequest
): Promise<ConsumerAuthResponse> {
  return unwrap(
    await apiClient.post<ApiResponse<ConsumerAuthResponse>>(
      '/consumers',
      request
    )
  )
}

export async function loginConsumer(
  request: LoginRequest
): Promise<ConsumerAuthResponse> {
  return unwrap(
    await apiClient.post<ApiResponse<ConsumerAuthResponse>>(
      '/consumers/login',
      request
    )
  )
}
