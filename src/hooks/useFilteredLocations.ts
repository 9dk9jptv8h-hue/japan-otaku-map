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

  // 地区提取（LOCATIONS 是模块级常量，不会变化）
  const regionList = useMemo(() => {
    const set = new Set<string>()
    LOCATIONS.forEach(loc => {
      const match = loc.address?.match(/^(京都府|大阪府|北海道|.{1,3}?[都道府県])/)
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
    if (selectedCategories.length > 0) {
      result = result.filter((loc) => selectedCategories.includes(loc.category))
    }

    // 地区过滤
    if (selectedRegion) {
      result = result.filter(loc => loc.address?.startsWith(selectedRegion))
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
