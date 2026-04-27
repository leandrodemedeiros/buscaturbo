import React from 'react';
import { Car, Trophy, Gauge } from 'lucide-react';
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { id: 'all', label: 'Todos', color: 'bg-zinc-800', activeText: 'text-white', border: 'border-zinc-300' },
  { id: 'passeio', label: 'Passeio', color: 'bg-blue-500', activeText: 'text-white', border: 'border-blue-200' },
  { id: 'colecionador', label: 'Colecionador', color: 'bg-amber-500', activeText: 'text-white', border: 'border-amber-200' },
  { id: 'esportivo', label: 'Esportivos', color: 'bg-red-500', activeText: 'text-white', border: 'border-red-200' },
];

export default function CategoryPills({ selectedCategory, onCategoryChange }) {
  return (
    <div className="bg-white border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 py-2.5">
        <div className="flex items-center gap-2">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className={cn(
                  "px-5 py-1.5 rounded-full font-semibold text-sm transition-all duration-200 border-2",
                  isSelected
                    ? [cat.color, cat.activeText, "border-transparent shadow-sm"]
                    : ["bg-white text-zinc-600 hover:text-zinc-900 hover:border-zinc-300 border-zinc-200"]
                )}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}