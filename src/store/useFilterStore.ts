import { create } from 'zustand'
import type { LocationCategory, SortOption } from '@/types'

interface FilterStore {
  searchQuery: string
  setSearchQuery: (q: string) => void

  selectedCategories: LocationCategory[]
  toggleCategory: (cat: LocationCategory) => void
  clearCategories: () => void

  sortBy: SortOption
  setSortBy: (sort: SortOption) => void

  selectedRegion: string | null
  setSelectedRegion: (region: string | null) => void
}

export const useFilterStore = create<FilterStore>((set) => ({
  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),

  selectedCategories: ['animate', 'melonbooks', 'mandarake', 'surugaya', 'gamers', 'lashinbang', 'kbooks'],
  toggleCategory: (cat) =>
    set((s) => ({
      selectedCategories: s.selectedCategories.includes(cat)
        ? s.selectedCategories.filter((c) => c !== cat)
        : [...s.selectedCategories, cat],
    })),
  clearCategories: () => set({ selectedCategories: ['animate', 'melonbooks', 'mandarake', 'surugaya', 'gamers', 'lashinbang', 'kbooks'] }),

  sortBy: 'rating',
  setSortBy: (sort) => set({ sortBy: sort }),

  selectedRegion: null,
  setSelectedRegion: (region) => set({ selectedRegion: region }),
}))
