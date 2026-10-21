import type { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, Typography } from '@mui/material'

import { RegisterConsumerForm } from '@/components/consumer/RegisterConsumerForm'
import { CONSUMER_LOGIN_PATH } from '@/lib/auth/constants'

export const metadata: Metadata = { title: 'Criar conta de consumidor' }

export default function ConsumerRegisterPage() {
  return (
    <Card>
      <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Criar conta de consumidor
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Cadastre-se para visualizar ofertas ativas e reservar produtos perto
          do vencimento com desconto.
        </Typography>
        <RegisterConsumerForm />
        <Typography variant="body2" sx={{ mt: 3, textAlign: 'center' }}>
          Já tem conta? <Link href={CONSUMER_LOGIN_PATH}>Entrar</Link>
        </Typography>
      </CardContent>
    </Card>
  )
}
