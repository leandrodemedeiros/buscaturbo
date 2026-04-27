import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevância' },
  { value: 'price_asc', label: 'Menor preço' },
  { value: 'price_desc', label: 'Maior preço' },
  { value: 'year_desc', label: 'Mais novo' },
  { value: 'year_asc', label: 'Mais antigo' },
  { value: 'mileage_asc', label: 'Menor km' },
  { value: 'hp_desc', label: 'Mais potente' },
];

const BODY_TYPES = [
  { value: 'sedan', label: 'Sedan' },
  { value: 'hatch', label: 'Hatch' },
  { value: 'suv', label: 'SUV' },
  { value: 'pickup', label: 'Pickup' },
  { value: 'coupe', label: 'Coupé' },
  { value: 'conversivel', label: 'Conversível' },
  { value: 'wagon', label: 'Wagon' },
  { value: 'van', label: 'Van' },
];

const FUELS = [
  { value: 'gasolina', label: 'Gasolina' },
  { value: 'etanol', label: 'Etanol' },
  { value: 'flex', label: 'Flex' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'eletrico', label: 'Elétrico' },
  { value: 'hibrido', label: 'Híbrido' },
];

const TRANSMISSIONS = [
  { value: 'manual', label: 'Manual' },
  { value: 'automatico', label: 'Automático' },
  { value: 'automatizado', label: 'Automatizado' },
  { value: 'cvt', label: 'CVT' },
];

const SELLER_TYPES = [
  { value: 'particular', label: 'Particular' },
  { value: 'loja', label: 'Loja' },
  { value: 'concessionaria', label: 'Concessionária' },
];

function SectionTitle({ children }) {
  return <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">{children}</h3>;
}

function CheckGroup({ items, selected = [], onChange }) {
  const toggle = (val) => {
    const next = selected.includes(val)
      ? selected.filter(v => v !== val)
      : [...selected, val];
    onChange(next);
  };
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {items.map(item => (
        <label key={item.value} className="flex items-center gap-2 p-2 rounded-lg hover:bg-zinc-50 cursor-pointer">
          <Checkbox checked={selected.includes(item.value)} onCheckedChange={() => toggle(item.value)} />
          <span className="text-sm text-zinc-700">{item.label}</span>
        </label>
      ))}
    </div>
  );
}

export default function FiltersDrawer({ open, onClose, filters, onFilterChange, onClearFilters, activeFiltersCount, sortBy, setSortBy }) {
  const [priceMin, setPriceMin] = useState(filters.priceRange?.[0] > 0 ? String(filters.priceRange[0]) : '');
  const [priceMax, setPriceMax] = useState(filters.priceRange?.[1] < 2000000 ? String(filters.priceRange[1]) : '');
  const [yearFrom, setYearFrom] = useState(filters.yearRange?.[0] || 2010);
  const [yearTo, setYearTo] = useState(filters.yearRange?.[1] || 2025);
  const [locationSearch, setLocationSearch] = useState(filters.locationSearch || '');

  const applyPrice = () => {
    const min = priceMin ? parseInt(priceMin.replace(/\D/g, '')) : 0;
    const max = priceMax ? parseInt(priceMax.replace(/\D/g, '')) : 2000000;
    onFilterChange({ priceRange: [min, max] });
  };

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-sm z-50 bg-white shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <div>
            <h2 className="text-base font-bold text-zinc-900">Filtros e Ordenação</h2>
            {activeFiltersCount > 0 && (
              <p className="text-xs text-zinc-500 mt-0.5">{activeFiltersCount} filtro(s) ativo(s)</p>
            )}
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-100">
            <X className="w-4 h-4 text-zinc-600" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-7">

          {/* Ordenação */}
          <div>
            <SectionTitle>Ordenar por</SectionTitle>
            <div className="flex flex-wrap gap-2">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setSortBy?.(opt.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
                    sortBy === opt.value
                      ? "bg-red-600 text-white border-red-600"
                      : "bg-white text-zinc-600 border-zinc-200 hover:border-red-300 hover:text-red-600"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preço */}
          <div>
            <SectionTitle>Faixa de Preço</SectionTitle>
            <div className="flex gap-3 mb-3">
              <div className="flex-1">
                <label className="text-xs text-zinc-500 mb-1 block">Mínimo</label>
                <input type="text" placeholder="R$ 0" value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-zinc-500 mb-1 block">Máximo</label>
                <input type="text" placeholder="Sem limite" value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400"
                />
              </div>
            </div>
            <Button onClick={applyPrice} size="sm" className="bg-red-500 hover:bg-red-600 text-white rounded-lg h-8 text-xs">Aplicar preço</Button>
          </div>

          {/* Ano */}
          <div>
            <SectionTitle>Ano do Modelo</SectionTitle>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-zinc-500 mb-1 block">De</label>
                <input type="number" min={1960} max={2025} value={yearFrom}
                  onChange={(e) => { const v = [parseInt(e.target.value), yearTo]; setYearFrom(parseInt(e.target.value)); onFilterChange({ yearRange: v }); }}
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-zinc-500 mb-1 block">Até</label>
                <input type="number" min={1960} max={2025} value={yearTo}
                  onChange={(e) => { const v = [yearFrom, parseInt(e.target.value)]; setYearTo(parseInt(e.target.value)); onFilterChange({ yearRange: v }); }}
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400"
                />
              </div>
            </div>
          </div>

          {/* Localização */}
          <div>
            <SectionTitle>Localização</SectionTitle>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Cidade ou estado (SP, RJ...)"
                value={locationSearch}
                onChange={(e) => { setLocationSearch(e.target.value); onFilterChange({ locationSearch: e.target.value }); }}
                className="w-full border border-zinc-200 rounded-lg pl-8 pr-3 py-2 text-sm outline-none focus:border-red-400"
              />
            </div>
          </div>

          {/* Carroceria */}
          <div>
            <SectionTitle>Tipo de Carroceria</SectionTitle>
            <CheckGroup
              items={BODY_TYPES}
              selected={filters.bodyTypes || []}
              onChange={(vals) => onFilterChange({ bodyTypes: vals })}
            />
          </div>

          {/* Combustível */}
          <div>
            <SectionTitle>Combustível</SectionTitle>
            <CheckGroup
              items={FUELS}
              selected={filters.fuels || []}
              onChange={(vals) => onFilterChange({ fuels: vals })}
            />
          </div>

          {/* Câmbio */}
          <div>
            <SectionTitle>Câmbio</SectionTitle>
            <CheckGroup
              items={TRANSMISSIONS}
              selected={filters.transmissions || []}
              onChange={(vals) => onFilterChange({ transmissions: vals })}
            />
          </div>

          {/* Tipo de Vendedor */}
          <div>
            <SectionTitle>Tipo de Vendedor</SectionTitle>
            <CheckGroup
              items={SELLER_TYPES}
              selected={filters.sellerTypes || []}
              onChange={(vals) => onFilterChange({ sellerTypes: vals })}
            />
          </div>

          {/* Histórico veicular */}
          <div>
            <SectionTitle>Extras</SectionTitle>
            <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-zinc-50 cursor-pointer">
              <input
                type="checkbox"
                checked={!!filters.hasHistory}
                onChange={e => onFilterChange({ hasHistory: e.target.checked })}
                className="w-4 h-4 accent-red-600"
              />
              <span className="text-sm text-zinc-700">Possui histórico veicular</span>
            </label>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-zinc-100 flex gap-3">
          {activeFiltersCount > 0 && (
            <Button variant="outline" onClick={() => { onClearFilters(); onClose(); }} className="flex-1 rounded-xl">
              Limpar filtros
            </Button>
          )}
          <Button onClick={onClose} className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl">
            Ver resultados
          </Button>
        </div>
      </div>
    </>
  );
}