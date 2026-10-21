import type { Metadata } from 'next'
import Link from 'next/link'
import { Alert, Card, CardContent, Typography } from '@mui/material'

import { ConsumerLoginForm } from '@/components/consumer/ConsumerLoginForm'
import {
  CONSUMER_HOME_PATH,
  CONSUMER_ORDERS_PATH,
  CONSUMER_REGISTER_PATH,
} from '@/lib/auth/constants'

export const metadata: Metadata = { title: 'Entrar como consumidor' }

/** Only consumer portal paths are accepted as `?next=`, so the login can't redirect off-site. */
function safeRedirect(next: string | string[] | undefined): string {
  if (
    typeof next === 'string' &&
    (next.startsWith(CONSUMER_HOME_PATH) ||
      next.startsWith(CONSUMER_ORDERS_PATH))
  ) {
    return next
  }
  return CONSUMER_HOME_PATH
}

export default async function ConsumerLoginPage({
  searchParams,
}: PageProps<'/consumer/login'>) {
  const { next, expired } = await searchParams

  return (
    <Card>
      <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Entrar como consumidor
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Acesse sua conta para explorar ofertas e reservar produtos com
          desconto.
        </Typography>
        {expired && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Sua sessão expirou. Entre novamente para continuar.
          </Alert>
        )}
        <ConsumerLoginForm redirectTo={safeRedirect(next)} />
        <Typography variant="body2" sx={{ mt: 3, textAlign: 'center' }}>
          Ainda não tem conta?{' '}
          <Link href={CONSUMER_REGISTER_PATH}>Cadastre-se gratuitamente</Link>
        </Typography>
      </CardContent>
    </Card>
  )
}
