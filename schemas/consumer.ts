import { z } from 'zod'

import type { RegisterConsumerRequest } from '@/types/consumer'

/*
 * Client-side mirror of the backend rules on ConsumerDTO (bean validation:
 * @NotBlank name, @NotBlank @Email email, @NotBlank password). Email
 * uniqueness is validated by ConsumerBusinessValidator on the backend and
 * comes back as an `EMAIL_ALREADY_EXISTS` sub-error mapped onto the field.
 */

const requiredText = (message: string) =>
  z.string().trim().min(1, { error: message, abort: true })

const email = requiredText('Informe o e-mail.').pipe(
  z.email('E-mail inválido.')
)

export const registerConsumerSchema = z.object({
  name: requiredText('Informe seu nome.'),
  email,
  password: z.string().min(1, 'Informe a senha.'),
})

export type RegisterConsumerFormValues = z.infer<typeof registerConsumerSchema>

export const CONSUMER_FORM_FIELDS = [
  'name',
  'email',
  'password',
] as const satisfies readonly (keyof RegisterConsumerFormValues)[]

export function toRegisterConsumerRequest(
  values: RegisterConsumerFormValues
): RegisterConsumerRequest {
  return values
}
