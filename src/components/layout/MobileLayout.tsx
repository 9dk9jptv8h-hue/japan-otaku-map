import type { LocationData } from '@/types'
import { MapView } from '@/components/map/MapContainer'
import { MarkersLayer } from '@/components/map/MarkersLayer'
import { MapControls } from '@/components/map/MapControls'
import { SearchBar } from '@/components/sidebar/SearchBar'
import { FilterPanel } from '@/components/sidebar/FilterPanel'
import { SortControl } from '@/components/sidebar/SortControl'
import { CardList } from '@/components/sidebar/CardList'
import { useUIStore } from '@/store/useUIStore'
import { useFilterStore } from '@/store/useFilterStore'
import { useDebounce } from '@/hooks/useDebounce'
import { Drawer } from '@/components/ui/Drawer'
import { Menu } from 'lucide-react'
import { useMemo } from 'react'

interface MobileLayoutProps {
  locations: LocationData[]
}

export function MobileLayout({ locations }: MobileLayoutProps) {
  const { drawerOpen, setDrawerOpen } = useUIStore()
  const { searchQuery, selectedCategories, sortBy } = useFilterStore()
  const debouncedSearch = useDebounce(searchQuery, 300)

  const filtered = useMemo(() => {
    let result = [...locations]
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase()
      result = result.filter(
        (loc) =>
          loc.name.toLowerCase().includes(q) ||
          loc.nameJa?.toLowerCase().includes(q) ||
          loc.description.toLowerCase().includes(q) ||
          loc.tags.some((t) => t.toLowerCase().includes(q))
      )
    }
    if (selectedCategories.length > 0) {
      result = result.filter((loc) => selectedCategories.includes(loc.category))
    }
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
  }, [locations, debouncedSearch, selectedCategories, sortBy])

  return (
    <div className="relative h-full w-full">
      {/* 地图全屏 — 没勾选分类时空地图 */}
      <MapView>
        <MarkersLayer locations={
          selectedCategories.length === 0
            ? []
            : locations.filter((loc) => selectedCategories.includes(loc.category))
        } />
      </MapView>

      {/* 顶部搜索栏 + 菜单按钮 */}
      <div className="absolute top-0 left-0 right-0 z-[1000] p-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl glass shadow-soft border border-[var(--color-sumi)]/10"
          >
            <Menu className="h-5 w-5 text-[var(--color-sumi)]/70" />
          </button>
          <div className="flex-1 glass rounded-xl shadow-soft border border-[var(--color-sumi)]/10">
            <SearchBar />
          </div>
        </div>
      </div>

      {/* 地图控件（通过 store 访问地图） */}
      <div className="absolute bottom-24 right-3 z-[1000]">
        <MapControls />
      </div>

      {/* 底部抽屉 */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <div className="space-y-4">
          <FilterPanel />
          <SortControl />
          <CardList locations={filtered} total={locations.length} />
        </div>
      </Drawer>
    </div>
  )
}
