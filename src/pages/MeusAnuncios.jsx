import { db } from '@/lib/db';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Trash2, Pencil, Zap, Plus, Car, AlertCircle, Loader2, ToggleRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from 'react-router-dom';

import { cn } from "@/lib/utils";

const formatPrice = (p) => p
  ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(p)
  : '—';

function AdCard({ vehicle, isActive, onDelete, onDuplicate, onActivate }) {
  const [deleting, setDeleting] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!window.confirm(`Tem certeza que deseja excluir o anúncio "${vehicle.title}"? Esta ação não pode ser desfeita.`)) return;
    setDeleting(true);
    await db.entities.Vehicle.delete(vehicle.id);
    onDelete(vehicle.id);
  };

  const handleDuplicate = async () => {
    setDuplicating(true);
    const { id, created_date, updated_date, created_by, ...data } = vehicle;
    const newAd = await db.entities.Vehicle.create({ ...data, title: data.title + ' (cópia)', is_featured: false });
    onDuplicate(newAd);
    setDuplicating(false);
  };

  const handleActivate = () => {
    if (!window.confirm('Ativar este anúncio irá inativar o anúncio atualmente ativo. Deseja continuar?')) return;
    onActivate(vehicle.id);
  };

  return (
    <div className={cn(
      "bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-shadow",
      isActive ? "border-zinc-100" : "border-zinc-100 opacity-75"
    )}>
      {/* Image */}
      <div className="relative">
        {vehicle.images?.[0] ? (
          <img src={vehicle.images[0]} alt={vehicle.title} className="w-full h-44 object-cover" />
        ) : (
          <div className="w-full h-44 bg-zinc-100 flex items-center justify-center">
            <Car className="w-10 h-10 text-zinc-300" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          {isActive ? (
            <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">Ativo</span>
          ) : (
            <span className="bg-zinc-400 text-white text-xs font-bold px-2 py-0.5 rounded-full">Inativo</span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-1">
        <p className="text-xs text-zinc-400 font-medium">{vehicle.brand} {vehicle.model}</p>
        <h3 className="font-bold text-zinc-900 text-sm leading-snug line-clamp-2">{vehicle.title}</h3>
        <p className="text-lg font-black text-red-600">{formatPrice(vehicle.price)}</p>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 grid grid-cols-2 gap-2">
        {!isActive && (
          <Button
            size="sm"
            onClick={handleActivate}
            className="col-span-2 rounded-xl gap-1.5 text-xs bg-green-600 hover:bg-green-700 text-white"
          >
            <ToggleRight className="w-3.5 h-3.5" /> Ativar anúncio
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/CriarAnuncio?edit=' + vehicle.id)}
          className="rounded-xl gap-1.5 text-xs"
        >
          <Pencil className="w-3.5 h-3.5" /> Editar
        </Button>
        <Button
          size="sm"
          onClick={() => navigate('/DestacarAnuncio?id=' + vehicle.id)}
          className="rounded-xl gap-1.5 text-xs bg-amber-500 hover:bg-amber-600 text-white"
        >
          <Zap className="w-3.5 h-3.5" /> Destacar
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDuplicate}
          disabled={duplicating}
          className="rounded-xl gap-1.5 text-xs"
        >
          {duplicating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Copy className="w-3.5 h-3.5" />}
          Duplicar
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-xl gap-1.5 text-xs text-red-600 border-red-200 hover:bg-red-50"
        >
          {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          Excluir
        </Button>
      </div>
    </div>
  );
}

function UpgradeCard() {
  return (
    <Link to="/Planos" className="block">
      <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-dashed border-red-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 h-full min-h-[280px] hover:border-red-400 hover:shadow-md transition-all cursor-pointer group">
        <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
          <Plus className="w-7 h-7 text-white" />
        </div>
        <div>
          <h3 className="font-black text-zinc-900 text-base">Anunciar mais</h3>
          <p className="text-sm text-zinc-500 mt-0.5">Fazer upgrade de plano</p>
        </div>
        <p className="text-xs text-zinc-500 max-w-[160px] leading-relaxed">
          Com o plano Vendedor você pode ter até 3 anúncios ativos.
        </p>
        <span className="bg-red-600 text-white text-xs font-bold px-4 py-1.5 rounded-full group-hover:bg-red-700 transition-colors">
          Ver planos
        </span>
      </div>
    </Link>
  );
}

export default function MeusAnuncios() {
  const [vehicles, setVehicles] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      try {
        const me = await db.auth.me();
        setUser(me);
        const all = await db.entities.Vehicle.filter({ created_by: me.email }, '-created_date', 50);
        setVehicles(all);
        // The most recently created one is "active"
        if (all.length > 0) setActiveId(all[0].id);
      } catch {
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleDelete = (id) => {
    setVehicles(prev => {
      const next = prev.filter(v => v.id !== id);
      // If deleted was active, set first remaining as active
      if (id === activeId && next.length > 0) setActiveId(next[0].id);
      else if (next.length === 0) setActiveId(null);
      return next;
    });
  };

  const handleDuplicate = (newV) => {
    setVehicles(prev => [newV, ...prev]);
    // Duplicated starts as inactive (activeId doesn't change)
  };

  const handleActivate = (id) => {
    setActiveId(id);
  };

  const userPlan = user?.plan || 'dono';
  const isFreePlan = userPlan === 'dono';
  const showUpgradeCard = isFreePlan;

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Nav */}
      <div className="bg-white border-b border-zinc-100 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a1012fd10d7df3befc3b79/50ef0cf69_logobt.png"
            alt="BuscaTurbo"
            className="h-8 w-auto object-contain"
          />
          <h1 className="font-bold text-zinc-900 text-base hidden sm:block">Meus anúncios</h1>
          <div className="ml-auto">
            <Link to="/CriarAnuncio">
              <Button className="bg-red-600 hover:bg-red-700 text-white rounded-xl gap-2 text-sm">
                <Plus className="w-4 h-4" /> Novo anúncio
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-zinc-900 sm:hidden">Meus anúncios</h1>
            {user && <p className="text-sm text-zinc-500 mt-0.5">{user.email}</p>}
          </div>
          {!loading && (
            <span className="text-sm text-zinc-500 bg-white border border-zinc-200 px-3 py-1 rounded-full">
              {vehicles.length} anúncio{vehicles.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
          </div>
        ) : vehicles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center">
              <Car className="w-8 h-8 text-zinc-400" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900">Nenhum anúncio ainda</h3>
              <p className="text-sm text-zinc-500 mt-1">Crie seu primeiro anúncio gratuitamente.</p>
            </div>
            <Link to="/CriarAnuncio">
              <Button className="bg-red-600 hover:bg-red-700 text-white rounded-xl gap-2">
                <Plus className="w-4 h-4" /> Criar primeiro anúncio
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {vehicles.map(v => (
              <AdCard
                key={v.id}
                vehicle={v}
                isActive={v.id === activeId}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
                onActivate={handleActivate}
              />
            ))}
            {showUpgradeCard && <UpgradeCard />}
          </div>
        )}

        {isFreePlan && vehicles.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-zinc-800">Você está no plano gratuito</p>
              <p className="text-xs text-zinc-500 mt-0.5">No plano gratuito apenas 1 anúncio pode estar ativo por vez. Faça upgrade para anunciar mais veículos simultaneamente.</p>
              <Link to="/Planos" className="inline-flex items-center gap-1 text-xs text-red-600 font-semibold mt-2 hover:underline">
                Ver planos <Zap className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}