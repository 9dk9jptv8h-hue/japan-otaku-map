import type { CategoryMeta } from '@/types'

// 四大分类 + 圣地巡礼
export const CATEGORIES: CategoryMeta[] = [
  { key: 'animate', label: 'Animate', color: '#e91e63', icon: 'store' },
  { key: 'melonbooks', label: 'Melonbooks', color: '#4caf50', icon: 'book' },
  { key: 'mandarake', label: 'Mandarake', color: '#ff9800', icon: 'diamond' },
  { key: 'pilgrimage', label: '圣地巡礼', color: '#d32f2f', icon: 'torii' },
]

// 日系色板
export const COLORS = {
  sakura: '#f2a7b4',
  sakuraLight: '#fce4e9',
  indigo: '#4a5a8a',
  indigoLight: '#e8ecf4',
  matcha: '#8b9e6b',
  matchaLight: '#edf2e8',
  washi: '#f7f3ed',
  sumi: '#3a3a3a',
  koi: '#d94a3a',
  koiLight: '#fce8e5',
  gold: '#c4a35a',
} as const
