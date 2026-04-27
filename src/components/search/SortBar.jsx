import React from 'react';
import { ArrowUpDown, Grid3X3, List, LayoutGrid, TrendingDown, TrendingUp, Clock, Gauge } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Mais relevantes', icon: ArrowUpDown },
  { value: 'price_asc', label: 'Menor preço', icon: TrendingDown },
  { value: 'price_desc', label: 'Maior preço', icon: TrendingUp },
  { value: 'year_desc', label: 'Mais novo', icon: Clock },
  { value: 'year_asc', label: 'Mais antigo', icon: Clock },
  { value: 'mileage_asc', label: 'Menor km', icon: Gauge },
  { value: 'hp_desc', label: 'Mais potente', icon: Gauge },
];

const VIEW_OPTIONS = [
  { value: 'grid', icon: Grid3X3 },
  { value: 'list', icon: List },
  { value: 'compact', icon: LayoutGrid },
];

export default function SortBar({
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  totalResults,
  groupBy,
  onGroupByChange,
  sellerTypeFilter,
  onSellerTypeChange,
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-zinc-200 flex-wrap gap-2">
      {/* Results count */}
      <div className="text-sm text-zinc-600">
        <span className="font-bold text-zinc-900 text-lg">{totalResults}</span> veículos
      </div>

      {/* Right side: sort, seller type, group, view */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Sort dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-500 hidden sm:inline">Ordenar:</span>
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-44 h-9 rounded-lg border-zinc-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <option.icon className="w-4 h-4 text-zinc-500" />
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Seller type filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-500 hidden sm:inline">Tipo de vendedor:</span>
          <Select value={sellerTypeFilter || 'all'} onValueChange={onSellerTypeChange}>
            <SelectTrigger className="w-36 h-9 rounded-lg border-zinc-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="profissional">Profissional</SelectItem>
              <SelectItem value="particular">Particular</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Group by */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-500 hidden sm:inline">Agrupar:</span>
          <Select value={groupBy || 'none'} onValueChange={onGroupByChange}>
            <SelectTrigger className="w-36 h-9 rounded-lg border-zinc-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sem agrupamento</SelectItem>
              <SelectItem value="brand">Por marca</SelectItem>
              <SelectItem value="category">Por categoria</SelectItem>
              <SelectItem value="body_type">Por carroceria</SelectItem>
              <SelectItem value="year">Por ano</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-zinc-200" />

        {/* View mode toggles */}
        <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg">
          {VIEW_OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant="ghost"
              size="sm"
              onClick={() => onViewModeChange(option.value)}
              className={cn(
                "h-8 w-8 p-0 rounded-md",
                viewMode === option.value
                  ? "bg-white shadow-sm text-zinc-900"
                  : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              <option.icon className="w-4 h-4" />
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}