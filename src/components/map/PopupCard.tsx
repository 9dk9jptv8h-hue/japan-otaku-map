import type { LocationData } from '@/types'
import { CATEGORIES } from '@/constants/theme'

interface PopupCardProps {
  location: LocationData
}

export function PopupCard({ location }: PopupCardProps) {
  const category = CATEGORIES.find((c) => c.key === location.category)

  return (
    <div style={{ width: 280, background: '#fff', overflow: 'hidden' }}>
      {/* 图片区 */}
      <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden', background: '#f0f0f0' }}>
        <img
          src={location.imageUrl}
          alt={location.name}
          style={{ height: '100%', width: '100%', objectFit: 'cover' }}
          loading="lazy"
        />
        {/* 分类标签 */}
        {category && (
          <span
            style={{
              position: 'absolute', top: 8, left: 8,
              borderRadius: 9999, padding: '2px 10px',
              fontSize: 12, fontWeight: 500,
              color: '#fff', backgroundColor: category.color,
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
          >
            {category.label}
          </span>
        )}
        {/* 评分 */}
        {location.rating && (
          <div style={{
            position: 'absolute', top: 8, right: 8,
            display: 'flex', alignItems: 'center', gap: 4,
            borderRadius: 9999, background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(4px)', padding: '2px 8px',
            fontSize: 12, color: '#fff',
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#f2a7b4" stroke="none">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            {location.rating}
          </div>
        )}
      </div>

      {/* 内容区 */}
      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
          <h3 style={{ fontWeight: 500, fontSize: 14, color: '#3a3a3a', lineHeight: 1.4 }}>
            {location.name}
          </h3>
          {location.nameJa && (
            <span style={{ fontSize: 12, color: '#999', whiteSpace: 'nowrap' }}>
              {location.nameJa}
            </span>
          )}
        </div>

        <p style={{ fontSize: 12, color: '#888', lineHeight: 1.5, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {location.description}
        </p>

        {/* 标签 */}
        {location.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
            {location.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                style={{
                  borderRadius: 9999, background: 'rgba(0,0,0,0.05)',
                  padding: '2px 8px', fontSize: 10, color: '#888',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* 底部信息 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10, color: '#bbb' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
            {location.address}
          </span>
          {location.visitCount && (
            <span>{(location.visitCount / 10000).toFixed(1)}万 访问</span>
          )}
        </div>
      </div>
    </div>
  )
}
