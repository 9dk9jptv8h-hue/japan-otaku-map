import type { LocationData } from '@/types'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { DesktopLayout } from './DesktopLayout'
import { MobileLayout } from './MobileLayout'

interface AppShellProps {
  locations: LocationData[]
}

export function AppShell({ locations }: AppShellProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)')

  if (isDesktop) {
    return <DesktopLayout locations={locations} />
  }

  return <MobileLayout locations={locations} />
}
