import React, { useState } from 'react';
import { Heart, Trash2, Car, Trophy, Gauge, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from "@/lib/utils";

const CATEGORY_CONFIG = {
  passeio:      { label: 'Passeio',      icon: Car,    color: 'bg-blue-600' },
  colecionador: { label: 'Colecionador', icon: Trophy, color: 'bg-amber-500' },
  esportivo:    { label: 'Esportivos',   icon: Gauge,  color: 'bg-red-600' },
};

const MOCK_FAVORITES = [
  { id: '1', brand: 'Honda', model: 'Civic', version: 'EX CVT', year_model: 2023, price: 145000, category: 'passeio', images: ['https://images.unsplash.com/photo-1550355291-bbee04a92027?w=400&q=80'] },
  { id: '2', brand: 'Toyota', model: 'Corolla', version: 'XEi', year_model: 2022, price: 138000, category: 'passeio', images: ['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&q=80'] },
  { id: '3', brand: 'Porsche', model: '911', version: 'Carrera S', year_model: 2021, price: 950000, category: 'esportivo', images: ['https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=400&q=80'] },
  { id: '4', brand: 'Ferrari', model: 'F8', version: 'Tributo', year_model: 2022, price: 3200000, category: 'esportivo', images: ['https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=400&q=80'] },
  { id: '5', brand: 'Ford', model: 'Mustang', version: 'GT Fastback', year_model: 1969, price: 420000, category: 'colecionador', images: ['https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&q=80'] },
];

const formatPrice = (p) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(p);

function FavoriteCard({ vehicle, onRemove }) {
  const img = vehicle.images?.[0] || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&q=80';

  const handleRemove = () => {
    if (!window.confirm(`Remover "${vehicle.brand} ${vehicle.model}" dos favoritos?`)) return;
    onRemove(vehicle.id);
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={img} alt={`${vehicle.brand} ${vehicle.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3">
          <p className="text-white font-black text-xl drop-shadow">{formatPrice(vehicle.price)}</p>
        </div>
        <button
          onClick={handleRemove}
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <div className="p-4 flex-1">
        <p className="text-xs text-zinc-400 font-medium uppercase tracking-wide">{vehicle.brand}</p>
        <h3 className="font-bold text-zinc-900 text-base">{vehicle.model}</h3>
        <p className="text-sm text-zinc-500 mt-0.5">{vehicle.version} · {vehicle.year_model}</p>
      </div>
    </div>
  );
}

export default function Favoritos() {
  const [favorites, setFavorites] = useState(MOCK_FAVORITES);

  const remove = (id) => setFavorites(prev => prev.filter(v => v.id !== id));

  const grouped = Object.entries(CATEGORY_CONFIG).reduce((acc, [key]) => {
    const items = favorites.filter(v => v.category === key);
    if (items.length > 0) acc[key] = items;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Nav */}
      <div className="bg-white border-b border-zinc-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a1012fd10d7df3befc3b79/50ef0cf69_logobt.png"
            alt="BuscaTurbo"
            className="h-8 w-auto object-contain"
          />
          <div className="flex items-center gap-2 ml-2">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            <h1 className="font-bold text-zinc-900">Meus Favoritos</h1>
          </div>
          <span className="ml-auto text-sm text-zinc-500">{favorites.length} veículo{favorites.length !== 1 ? 's' : ''} salvo{favorites.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <Heart className="w-16 h-16 text-zinc-200 mb-4" />
            <h2 className="text-xl font-bold text-zinc-400 mb-2">Nenhum favorito ainda</h2>
            <p className="text-zinc-400 text-sm">Salve veículos que você gostar para encontrá-los aqui.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(grouped).map(([catKey, vehicles]) => {
              const { label, icon: Icon, color } = CATEGORY_CONFIG[catKey];
              return (
                <section key={catKey}>
                  <div className="flex items-center gap-3 mb-5">
                    <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", color)}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-zinc-900">{label}</h2>
                    <span className="text-sm text-zinc-400">{vehicles.length} veículo{vehicles.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {vehicles.map(v => (
                      <FavoriteCard key={v.id} vehicle={v} onRemove={remove} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}