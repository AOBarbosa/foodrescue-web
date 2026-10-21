import {
  type QueryClient,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { loginConsumer, registerConsumer } from '@/lib/api/consumers'
import { setSession } from '@/lib/auth/session'
import type {
  ConsumerAuthResponse,
  RegisterConsumerRequest,
} from '@/types/consumer'
import type { LoginRequest } from '@/types/establishment'

/** Starts a fresh consumer session: nothing cached for a previous account may leak into it. */
function startConsumerSession(
  queryClient: QueryClient,
  { consumer, token }: ConsumerAuthResponse
) {
  queryClient.clear()
  setSession(token, {
    role: 'CONSUMER',
    id: consumer.id,
    name: consumer.name,
  })
}

export function useRegisterConsumer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: RegisterConsumerRequest) => registerConsumer(request),
    onSuccess: (response) => startConsumerSession(queryClient, response),
  })
}

export function useLoginConsumer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: LoginRequest) => loginConsumer(request),
    onSuccess: (response) => startConsumerSession(queryClient, response),
  })
}
