import { ConsumerShell } from '@/components/layout/ConsumerShell'

export default function ConsumerPortalLayout({ children }: LayoutProps<'/'>) {
  return <ConsumerShell>{children}</ConsumerShell>
}
