import { useMemo } from 'react'
import { useFilterStore } from '@/store/useFilterStore'
import { useDebounce } from '@/hooks/useDebounce'
import { mockLocations as LOCATIONS } from '@/constants/mockData'

export function useFilteredLocations() {
  const searchQuery = useFilterStore(s => s.searchQuery)
  const selectedCategories = useFilterStore(s => s.selectedCategories)
  const selectedRegion = useFilterStore(s => s.selectedRegion)
  const sortBy = useFilterStore(s => s.sortBy)
  const debouncedSearch = useDebounce(searchQuery, 300)

  // 地区提取
  // NOTE: useMemo with empty deps is intentional — LOCATIONS is a module-level
  // constant (imported from mockData.ts), so it never changes at runtime.
  const regionList = useMemo(() => {
    const set = new Set<string>()
    LOCATIONS.forEach(loc => {
      const cleanAddr = loc.address?.replace(/^〒\d{3}-\d{4}\s*/, '')
      const match = cleanAddr?.match(/^(京都府|大阪府|北海道|.{1,3}?[都道府県])/)
      if (match) set.add(match[1])
    })
    return Array.from(set).sort()
  }, [])

  const filteredLocations = useMemo(() => {
    let result = [...LOCATIONS]

    // 搜索过滤（含 address — Issue 16）
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase()
      result = result.filter(
        (loc) =>
          loc.name.toLowerCase().includes(q) ||
          loc.nameJa?.toLowerCase().includes(q) ||
          loc.description.toLowerCase().includes(q) ||
          loc.tags.some((t) => t.toLowerCase().includes(q)) ||
          loc.address?.toLowerCase().includes(q)
      )
    }

    // 分类过滤
    // 无条件执行：selectedCategories 初始为全部7个品牌（useFilterStore 默认值），
    // 用户逐一切掉全部品牌后数组为空 —— 若此时跳过过滤会显示全部176家，
    // 但 FilterPanel 上没有任何品牌呈选中态，状态与结果矛盾。
    // 因此空数组直接过滤为空结果，UI 显示 EmptyState，语义自洽。
    result = result.filter((loc) => selectedCategories.includes(loc.category))

    // 地区过滤
    if (selectedRegion) {
      result = result.filter(loc => loc.address?.includes(selectedRegion))
    }

    // 排序
    switch (sortBy) {
      case 'rating':
        result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
        break
      case 'visits':
        result.sort((a, b) => (b.visitCount ?? 0) - (a.visitCount ?? 0))
        break
      case 'recent':
        // ISO 8601 日期字符串（如 "2025-04-24"）的字典序与时间顺序一致，
        // 因此 localeCompare 等价于按日期从新到旧排序。
        result.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        break
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name, 'zh'))
        break
    }

    return result
  }, [debouncedSearch, selectedCategories, sortBy, selectedRegion])

  return { filteredLocations, regionList }
}
