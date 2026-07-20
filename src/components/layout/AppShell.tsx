import type { LocationData } from '@/types'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { DesktopLayout } from './DesktopLayout'
import { MobileLayout } from './MobileLayout'
import { ChatAssistant } from '@/components/chat/ChatAssistant'

interface AppShellProps {
  locations: LocationData[]
}

export function AppShell({ locations }: AppShellProps) {
  // NOTE: useMediaQuery 在 SSR 场景下服务端返回 false，客户端水合后才变为 true，
  // 会导致短暂的水合闪烁（先渲染 MobileLayout 再切换到 DesktopLayout）。
  // 本项目为纯客户端 SPA（Vite + index.html），不存在 SSR，因此无实际影响。
  // 若未来引入 SSR 框架（Next.js/Remix），需改用 useState+useEffect 延迟判断。
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
