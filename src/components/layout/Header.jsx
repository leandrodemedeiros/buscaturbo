import { db } from '@/lib/db';

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { User, Heart, Star, LayoutList, LogOut } from 'lucide-react';
import { cn } from "@/lib/utils";
import AlertsPopover from '@/components/layout/AlertsPopover.jsx';

const CATEGORIES = [
  { id: 'all',          label: 'Todos',        active: 'bg-zinc-900 text-white',  inactive: 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100' },
  { id: 'passeio',      label: 'Passeio',      active: 'bg-blue-600 text-white',  inactive: 'text-zinc-600 hover:text-blue-600 hover:bg-blue-50' },
  { id: 'colecionador', label: 'Colecionador',  active: 'bg-amber-500 text-white', inactive: 'text-zinc-600 hover:text-amber-600 hover:bg-amber-50' },
  { id: 'esportivo',    label: 'Esportivos',   active: 'bg-red-600 text-white',   inactive: 'text-zinc-600 hover:text-red-600 hover:bg-red-50' },
];

export default function Header({ selectedCategory = 'all', onCategoryChange }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    db.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const handleLogin = () => db.auth.redirectToLogin(window.location.href);
  const handleLogout = () => db.auth.logout('/');

  return (
    <header className="bg-white border-b border-zinc-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a1012fd10d7df3befc3b79/50ef0cf69_logobt.png"
              alt="BuscaTurbo"
              className="h-10 w-auto object-contain"
            />
          </Link>

          {/* Category pills */}
          <div className="flex items-center gap-1 flex-1 justify-center">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onCategoryChange?.(cat.id)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200",
                    isSelected ? cat.active : cat.inactive
                  )}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <Link to="/Favoritos" className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl hover:bg-zinc-100 transition-colors text-zinc-600 hover:text-zinc-900">
              <Heart className="w-5 h-5" />
              <span className="text-[10px] font-medium">Favoritos</span>
            </Link>
            <Link to="/Planos" className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl hover:bg-zinc-100 transition-colors text-zinc-600 hover:text-zinc-900">
              <Star className="w-5 h-5" />
              <span className="text-[10px] font-medium">Planos</span>
            </Link>
            <AlertsPopover />

            {user ? (
              <>
                <Link to="/MeusAnuncios" className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl hover:bg-zinc-100 transition-colors text-zinc-600 hover:text-zinc-900">
                  <LayoutList className="w-5 h-5" />
                  <span className="text-[10px] font-medium">Meus anúncios</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl hover:bg-zinc-100 transition-colors text-zinc-600 hover:text-zinc-900"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-[10px] font-medium">Sair</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleLogin}
                className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl hover:bg-zinc-100 transition-colors text-zinc-600 hover:text-zinc-900"
              >
                <User className="w-5 h-5" />
                <span className="text-[10px] font-medium">Entrar</span>
              </button>
            )}

            <Link
              to="/CriarAnuncio"
              className="ml-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors shadow-md shadow-red-500/20"
            >
              Anunciar
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}