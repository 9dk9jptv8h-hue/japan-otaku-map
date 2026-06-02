import { type ReactNode, useEffect } from 'react'
import { cn } from '@/utils/cn'

interface DrawerProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  height?: string
}

export function Drawer({ open, onClose, children, height = '60vh' }: DrawerProps) {
  // 阻止 drawer 内部滚动穿透
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* 遮罩层 */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* 抽屉面板 */}
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 glass rounded-t-2xl transition-transform duration-500 ease-out',
          'shadow-[0_-8px_32px_rgba(0,0,0,0.12)]',
          open ? 'translate-y-0' : 'translate-y-full'
        )}
        style={{ maxHeight: height }}
      >
        {/* 拖拽手柄 */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-[var(--color-sumi)]/20" />
        </div>
        <div className="overflow-y-auto px-4 pb-6" style={{ maxHeight: `calc(${height} - 32px)` }}>
          {children}
        </div>
      </div>
    </>
  )
}
