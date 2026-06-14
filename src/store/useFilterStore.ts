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
}

export const useFilterStore = create<FilterStore>((set) => ({
  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),

  selectedCategories: ['animate', 'melonbooks', 'mandarake', 'pilgrimage'],
  toggleCategory: (cat) =>
    set((s) => ({
      selectedCategories: s.selectedCategories.includes(cat)
        ? s.selectedCategories.filter((c) => c !== cat)
        : [...s.selectedCategories, cat],
    })),
  clearCategories: () => set({ selectedCategories: [] }),

  sortBy: 'rating',
  setSortBy: (sort) => set({ sortBy: sort }),
}))
