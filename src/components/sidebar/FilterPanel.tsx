import { useMemo } from 'react'
import { useFilterStore } from '@/store/useFilterStore'
import { CATEGORIES } from '@/constants/theme'
import type { LocationCategory, LocationData } from '@/types'
import { cn } from '@/utils/cn'

interface FilterPanelProps {
  locations?: LocationData[]
}

// 品牌渐变深色端：把品牌色压暗约 15%，生成卡片左侧渐变块的深色终点
function darken(hex: string, percent = 0.15): string {
  const value = hex.replace('#', '')
  const full =
    value.length === 3
      ? value
          .split('')
          .map((c) => c + c)
          .join('')
      : value
  const int = parseInt(full, 16)
  const r = Math.max(0, Math.round(((int >> 16) & 0xff) * (1 - percent)))
  const g = Math.max(0, Math.round(((int >> 8) & 0xff) * (1 - percent)))
  const b = Math.max(0, Math.round((int & 0xff) * (1 - percent)))
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`
}

const ALL_CHIP =
  'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-[12px] font-semibold ' +
  'transition-[background-color,border-color,color,transform,box-shadow] duration-200 ease-out active:scale-95 ' +
  'motion-reduce:scale-100 motion-reduce:transform-none motion-reduce:transition-none'

// 注意：Tailwind v4 里 translate/scale 走原生 CSS 属性，过渡属性列表需显式带上 translate,scale 才会真正丝滑
const CARD_BASE =
  'group flex h-[56px] w-full items-center gap-2.5 rounded-xl border border-[var(--color-border)] bg-white/80 px-2.5 py-2 text-left ' +
  'transition-[background-color,border-color,color,box-shadow,transform,translate,scale] duration-200 ease-out ' +
  // 注：Tailwind v4 扫描器不识别裸小数任意值 scale-[0.97]，用命名 scale-95（0.95）实现等价回弹
  'hover:-translate-y-0.5 hover:shadow-md active:scale-95 ' +
  'motion-reduce:translate-y-0 motion-reduce:scale-100 motion-reduce:transform-none motion-reduce:transition-none'

export function FilterPanel({ locations }: FilterPanelProps) {
  const selectedCategories = useFilterStore((s) => s.selectedCategories)
  const toggleCategory = useFilterStore((s) => s.toggleCategory)
  const clearCategories = useFilterStore((s) => s.clearCategories)
  const selectOnly = useFilterStore((s) => s.selectOnly)

  const allSelected = selectedCategories.length === CATEGORIES.length
  const partialSelected = selectedCategories.length > 0 && !allSelected

  const handleCategoryClick = (cat: { key: LocationCategory }) => {
    if (allSelected) {
      // 全选态下点品牌 → 聚焦独显该品牌（用户直觉：点谁看谁）
      selectOnly(cat.key)
    } else if (selectedCategories.includes(cat.key) && selectedCategories.length === 1) {
      // 独显态再点当前独显品牌 → 恢复全选
      clearCategories()
    } else {
      // 部分选中态 → 保持原有 toggle 微调
      toggleCategory(cat.key)
    }
  }

  const counts = useMemo(() => {
    if (!locations || locations.length === 0) return null
    const map = new Map<string, number>()
    for (const loc of locations) {
      map.set(loc.category, (map.get(loc.category) ?? 0) + 1)
    }
    return map
  }, [locations])

  return (
    <div role="group" aria-label="品牌筛选" className="flex flex-col gap-2">
      {/* 全部 — 恢复默认 */}
      <button
        type="button"
        onClick={clearCategories}
        aria-pressed={allSelected}
        className={cn(
          ALL_CHIP,
          allSelected
            ? 'border-transparent bg-[var(--color-accent)] text-white shadow-[var(--shadow-glow-accent)]'
            : 'border-[var(--color-border)] bg-white/70 text-[var(--color-text-dim)] hover:border-[var(--color-accent)]/35 hover:bg-white hover:text-[var(--color-text)]'
        )}
      >
        <span className={cn('h-2 w-2 rounded-full', allSelected ? 'bg-white/90' : 'bg-[var(--color-sumi)]/20')} />
        全部
        {locations && <span className="text-[10px] tabular-nums opacity-80">{locations.length}</span>}
      </button>

      {/* 品牌 2 列徽章卡网格 */}
      <div className="grid grid-cols-2 gap-2">
        {CATEGORIES.map((cat) => {
          // 全选状态下所有品牌均为默认状态，避免初始界面一片彩色。
          // 一旦用户关掉某个品牌，保留的品牌才显示选中态。
          const active = !allSelected && selectedCategories.includes(cat.key)
          const dimmed = partialSelected && !active

          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => handleCategoryClick(cat)}
              aria-pressed={active}
              aria-label={`筛选 ${cat.label}`}
              className={cn(CARD_BASE, dimmed && 'opacity-40')}
              style={
                active
                  ? {
                      // 品牌色 9% 淡色底 + 50% 品牌色边框，label 继承品牌色
                      backgroundColor: cat.color + '18',
                      borderColor: cat.color + '80',
                      color: cat.color,
                    }
                  : undefined
              }
            >
              {/* 品牌色渐变圆角块（内含英文首字母） */}
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow-sm"
                style={{ background: `linear-gradient(135deg, ${cat.color} 0%, ${darken(cat.color)} 100%)` }}
              >
                {cat.label.charAt(0).toUpperCase()}
              </span>

              {/* 右侧：label + 计数 */}
              <span className="flex min-w-0 flex-1 flex-col">
                <span
                  className={cn(
                    'truncate text-[13px] font-semibold leading-tight transition-colors duration-200',
                    active ? '' : 'text-[var(--color-text)]'
                  )}
                >
                  {cat.label}
                </span>
                {counts && (
                  <span
                    className={cn(
                      'mt-0.5 inline-flex w-fit items-center rounded-full tabular-nums leading-none transition-[background-color,color,scale] duration-200 ease-out',
                      active
                        ? 'scale-105 px-1.5 py-px text-[10px] font-semibold text-white'
                        : 'scale-100 text-[11px] text-[var(--color-text-dim)]'
                    )}
                    style={active ? { backgroundColor: cat.color } : undefined}
                  >
                    {counts.get(cat.key) ?? 0}
                  </span>
                )}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
