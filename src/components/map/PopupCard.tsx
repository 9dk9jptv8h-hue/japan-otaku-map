import { memo } from 'react'
import type { LocationData } from '@/types'
import { CATEGORIES } from '@/constants/theme'
import { getCityPhoto } from '@/utils/city-photo'

interface PopupCardProps {
  location: LocationData
}

export const PopupCard = memo(function PopupCard({ location }: PopupCardProps) {
  const category = CATEGORIES.find((c) => c.key === location.category)
  const photoUrl = getCityPhoto(location.name, location.address)

  return (
    <div className="w-[280px] overflow-hidden" style={{ fontFamily: 'var(--font-sans)' }}>
      {/* 城市照片 — 动态加载 */}
      <div className="relative h-[120px] overflow-hidden bg-gray-100">
        <img
          src={photoUrl}
          alt={location.address}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-out hover:scale-105"
          onError={(e) => {
            // 图片加载失败时显示渐变占位
            const el = e.currentTarget
            el.style.display = 'none'
            const parent = el.parentElement
            if (parent) {
              parent.style.background = category
                ? `linear-gradient(135deg, ${category.color}33, ${category.color}11)`
                : 'linear-gradient(135deg, #fce4ec, #e3f2fd)'
            }
          }}
        />
        {/* 照片底部渐变过渡 */}
        <div
          className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, var(--color-surface), transparent)',
          }}
        />

        {/* 分类标签 — 浮于照片左上 */}
        {category && (
          <span
            className="absolute top-3 left-3 rounded-lg px-2.5 py-1 text-[10px] font-bold tracking-wide text-white shadow-md"
            style={{ backgroundColor: category.color }}
          >
            {category.label}
          </span>
        )}

        {/* 评分星 — 浮于照片右上 */}
        {location.rating && (
          <span className="absolute top-3 right-3 flex items-center gap-1 rounded-lg bg-black/40 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#f2a7b4" stroke="none">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            {location.rating}
          </span>
        )}
      </div>

      {/* 内容区 */}
      <div className="px-4 pb-4 pt-3 space-y-2.5">
        {/* 店名 */}
        <div>
          <h3 className="text-[15px] font-bold text-[var(--color-text)] leading-tight">
            {location.name}
          </h3>
          {location.nameJa && (
            <p className="text-[11px] text-[var(--color-text-dim)]/60 mt-0.5">
              {location.nameJa}
            </p>
          )}
        </div>

        {/* 简介 */}
        <p className="text-[12px] text-[var(--color-text-dim)] leading-relaxed line-clamp-2">
          {location.description}
        </p>

        {/* 标签 */}
        {location.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {location.tags.slice(0, 5).map((tag) => (
              <span
                key={tag}
                className="rounded-md px-2 py-0.5 text-[10px] font-medium"
                style={{
                  backgroundColor: category ? `${category.color}15` : '#f5f5f5',
                  color: category ? category.color : '#888',
                  border: category ? `1px solid ${category.color}25` : '1px solid #eee',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* 底栏：地址 + 访问量 */}
        <div className="flex items-center justify-between pt-2.5 border-t border-[var(--color-border)]">
          <span className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-dim)]/50 max-w-[160px] truncate">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
            {location.address}
          </span>
          {location.visitCount != null && (
            <span className="text-[11px] font-semibold text-[var(--color-text)]/70 shrink-0">
              🔥 {(location.visitCount / 10000).toFixed(1)}万
            </span>
          )}
        </div>
      </div>
    </div>
  )
})
