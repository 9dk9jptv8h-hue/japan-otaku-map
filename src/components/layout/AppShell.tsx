import type { LocationData } from '@/types'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { DesktopLayout } from './DesktopLayout'
import { MobileLayout } from './MobileLayout'
import { ChatAssistant } from '@/components/chat/ChatAssistant'

interface AppShellProps {
  locations: LocationData[]
}

export function AppShell({ locations }: AppShellProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)')

  return (
    <>
      {isDesktop ? (
        <DesktopLayout locations={locations} />
      ) : (
        <MobileLayout locations={locations} />
      )}
      <ChatAssistant />
    </>
  )
}
