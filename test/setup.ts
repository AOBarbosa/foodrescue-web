import { cleanup, configure } from '@testing-library/react'
import { afterEach } from 'vitest'

import { clearSession } from '@/lib/auth/session'

import '@testing-library/jest-dom/vitest'

// findBy*/waitFor default to 1s, too tight for MUI forms under load.
configure({ asyncUtilTimeout: 3_000 })

afterEach(() => {
  cleanup()
  clearSession()
})
