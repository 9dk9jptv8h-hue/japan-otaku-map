import { Search } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { useFilterStore } from '@/store/useFilterStore'

export function SearchBar() {
  const { searchQuery, setSearchQuery } = useFilterStore()

  return (
    <div className="relative">
      <Input
        icon={<Search className="h-4 w-4" />}
        placeholder="搜索地点、标签..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onClear={() => setSearchQuery('')}
      />
    </div>
  )
}
