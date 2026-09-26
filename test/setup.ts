import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

import { clearSession } from '@/lib/auth/session'

import '@testing-library/jest-dom/vitest'

afterEach(() => {
  cleanup()
  clearSession()
})
