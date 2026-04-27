import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Search, X, Zap, Gauge, Trophy, Car } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { id: 'all', label: 'Todos', icon: Car, color: 'bg-zinc-600' },
  { id: 'passeio', label: 'Passeio', icon: Car, color: 'bg-blue-500' },
  { id: 'colecionador', label: 'Colecionador', icon: Trophy, color: 'bg-amber-500' },
  { id: 'esportivo', label: 'Esportivos', icon: Gauge, color: 'bg-red-500' },
];

export default function SearchBar({ 
  searchQuery, 
  onSearchChange, 
  selectedCategory, 
  onCategoryChange,
  totalResults,
  isSearching 
}) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  const handleClear = useCallback(() => {
    onSearchChange('');
    inputRef.current?.focus();
  }, [onSearchChange]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  }, [handleClear]);

  return (
    <div className="w-full">
      {/* Main Search Container */}
      <div className="relative max-w-4xl mx-auto">
        <div className={cn(
          "relative flex items-center rounded-2xl transition-all duration-300",
          "bg-white shadow-lg border-2",
          isFocused ? "border-red-500 shadow-red-500/20 shadow-xl" : "border-zinc-200"
        )}>
          {/* Search Icon with animation */}
          <div className="absolute left-5 flex items-center pointer-events-none">
            {isSearching ? (
              <div className="relative">
                <Zap className="w-6 h-6 text-red-500 animate-pulse" />
                <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping" />
              </div>
            ) : (
              <Search className={cn(
                "w-6 h-6 transition-colors",
                isFocused ? "text-red-500" : "text-zinc-400"
              )} />
            )}
          </div>

          {/* Input Field */}
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder="Busque por marca, modelo ou versão..."
            className={cn(
              "w-full h-14 pl-14 pr-32 text-lg font-medium",
              "bg-transparent outline-none placeholder:text-zinc-400",
              "text-zinc-900"
            )}
          />

          {/* Right side actions */}
          <div className="absolute right-3 flex items-center gap-2">
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-8 w-8 p-0 rounded-full hover:bg-zinc-100"
              >
                <X className="w-4 h-4 text-zinc-500" />
              </Button>
            )}
            <Button 
              className={cn(
                "h-10 px-5 rounded-xl font-semibold",
                "bg-gradient-to-r from-red-500 to-red-600",
                "hover:from-red-600 hover:to-red-700",
                "shadow-lg shadow-red-500/25",
                "transition-all duration-300"
              )}
            >
              <Zap className="w-4 h-4 mr-2" />
              Buscar
            </Button>
          </div>
        </div>

        {/* Results count indicator */}
        {searchQuery && (
          <div className="absolute -bottom-6 left-0 text-sm text-zinc-500">
            {isSearching ? (
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                Buscando...
              </span>
            ) : (
              <span>
                <strong className="text-zinc-900">{totalResults}</strong> veículos encontrados
              </span>
            )}
          </div>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex items-center justify-center gap-2 mt-8">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-full",
                "font-semibold text-sm transition-all duration-300",
                "border-2",
                isSelected ? [
                  "text-white border-transparent",
                  cat.color,
                  "shadow-lg",
                ] : [
                  "bg-white text-zinc-700 border-zinc-200",
                  "hover:border-zinc-300 hover:shadow-md"
                ]
              )}
            >
              <Icon className="w-4 h-4" />
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}