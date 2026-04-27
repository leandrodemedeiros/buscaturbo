import React, { useState } from 'react';
import { X, Search, Zap, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import FiltersDrawer from '@/components/search/FiltersDrawer.jsx';

const CATEGORY_COLORS = {
  all: 'bg-[#18181b]',
  passeio: 'bg-blue-600',
  colecionador: 'bg-amber-500',
  esportivo: 'bg-red-700',
};

const QUICK_FILTERS = [
  { key: 'fuel', value: 'flex',      label: 'Flex' },
  { key: 'fuel', value: 'eletrico',  label: 'Elétrico' },
  { key: 'fuel', value: 'hibrido',   label: 'Híbrido' },
  { key: 'fuel', value: 'diesel',    label: 'Diesel' },
  { key: 'transmission', value: 'automatico', label: 'Automático' },
  { key: 'transmission', value: 'manual',     label: 'Manual' },
];

export default function FilterBar({
  filters,
  onFilterChange,
  onClearFilters,
  activeFiltersCount,
  searchQuery,
  onSearchChange,
  isSearching,
  selectedCategory,
  onCategoryChange,
  sortBy,
  setSortBy,
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const bgColor = CATEGORY_COLORS[selectedCategory] || 'bg-[#18181b]';

  const isQuickActive = (key, value) => filters?.[key] === value;

  const toggleQuick = (key, value) => {
    if (isQuickActive(key, value)) {
      onFilterChange?.(key, '');
    } else {
      onFilterChange?.(key, value);
    }
  };

  return (
    <>
      <div className={cn("transition-colors duration-300", bgColor)}>
        <div className="max-w-7xl mx-auto px-4 py-2.5 space-y-2">

          {/* Row 1: search + buttons */}
          <div className="flex items-center gap-3">
            {/* Search bar */}
            <div className="relative flex items-center flex-1 min-w-0">
              <div className="absolute left-3 pointer-events-none">
                {isSearching
                  ? <Zap className="w-4 h-4 text-white animate-pulse" />
                  : <Search className="w-4 h-4 text-white/70" />
                }
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
                placeholder="Busque por marca, modelo, versão..."
                className="w-full h-9 pl-9 pr-8 text-sm bg-white/20 border border-white/30 rounded-xl outline-none placeholder:text-white/60 text-white focus:bg-white/30 focus:border-white/70"
              />
              {searchQuery && (
                <button onClick={() => onSearchChange?.('')} className="absolute right-2.5 text-white/60 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="w-px h-6 bg-white/30 flex-shrink-0" />

            {activeFiltersCount > 0 && (
              <Button variant="ghost" onClick={onClearFilters}
                className="h-9 px-3 rounded-xl text-white/80 hover:text-white hover:bg-white/20 flex-shrink-0 text-sm">
                <X className="w-3.5 h-3.5 mr-1" />
                Limpar ({activeFiltersCount})
              </Button>
            )}

            <Button
              variant="ghost"
              onClick={() => setDrawerOpen(true)}
              className="h-9 px-4 rounded-xl font-semibold text-sm border border-white/40 text-white hover:bg-white/20 hover:border-white/70 flex-shrink-0 gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Mais filtros
              {activeFiltersCount > 0 && (
                <span className="bg-white text-zinc-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </div>

          {/* Row 2: quick filter pills */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-0.5">
            {QUICK_FILTERS.map(({ key, value, label }) => {
              const active = isQuickActive(key, value);
              return (
                <button
                  key={`${key}-${value}`}
                  onClick={() => toggleQuick(key, value)}
                  className={cn(
                    "flex-shrink-0 h-7 px-3 rounded-full text-xs font-semibold border transition-all",
                    active
                      ? "bg-white text-zinc-900 border-white"
                      : "bg-white/10 text-white/80 border-white/20 hover:bg-white/20 hover:text-white"
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>

        </div>
      </div>

      <FiltersDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={filters}
        onFilterChange={onFilterChange}
        onClearFilters={onClearFilters}
        activeFiltersCount={activeFiltersCount}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />
    </>
  );
}