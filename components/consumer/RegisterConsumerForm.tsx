'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, Button, Stack, TextField } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'

import { PasswordField } from '@/components/ui/PasswordField'
import { useRegisterConsumer } from '@/hooks/useConsumers'
import { CONSUMER_HOME_PATH } from '@/lib/auth/constants'
import { applyServerErrors } from '@/lib/forms/applyServerErrors'
import {
  CONSUMER_FORM_FIELDS,
  type RegisterConsumerFormValues,
  registerConsumerSchema,
  toRegisterConsumerRequest,
} from '@/schemas/consumer'

const EMPTY: RegisterConsumerFormValues = {
  name: '',
  email: '',
  password: '',
}

export function RegisterConsumerForm() {
  const router = useRouter()
  const registerConsumer = useRegisterConsumer()
  const [formError, setFormError] = useState<string | null>(null)
  const { control, handleSubmit, setError } =
    useForm<RegisterConsumerFormValues>({
      resolver: zodResolver(registerConsumerSchema),
      defaultValues: EMPTY,
    })

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    try {
      await registerConsumer.mutateAsync(toRegisterConsumerRequest(values))
      router.replace(CONSUMER_HOME_PATH)
    } catch (error) {
      setFormError(applyServerErrors(error, setError, CONSUMER_FORM_FIELDS))
    }
  })

  return (
    <Stack component="form" noValidate onSubmit={onSubmit} spacing={2}>
      <Controller
        name="name"
        control={control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            label="Nome"
            autoComplete="name"
            autoFocus
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
          />
        )}
      />
      <Controller
        name="email"
        control={control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            type="email"
            label="E-mail"
            autoComplete="email"
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
          />
        )}
      />
      <Controller
        name="password"
        control={control}
        render={({ field, fieldState }) => (
          <PasswordField
            {...field}
            label="Senha"
            autoComplete="new-password"
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
          />
        )}
      />
      {formError && <Alert severity="error">{formError}</Alert>}
      <Button
        type="submit"
        variant="contained"
        size="large"
        loading={registerConsumer.isPending}
      >
        Criar conta
      </Button>
    </Stack>
  )
}
