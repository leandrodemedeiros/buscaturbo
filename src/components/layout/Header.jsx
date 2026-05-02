import { db } from '@/lib/db';

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { User, Heart, Star, LayoutList, LogOut, Shield, ChevronDown, LayoutDashboard, Bell } from 'lucide-react';
import { cn } from "@/lib/utils";
import AlertsPopover from '@/components/layout/AlertsPopover.jsx';
import LoginModal from '@/components/auth/LoginModal';
import { useAdmin } from '@/lib/useAdmin';

const CATEGORIES = [
  { id: 'all',          label: 'Todos',       active: 'bg-zinc-900 text-white',  inactive: 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100' },
  { id: 'passeio',      label: 'Passeio',     active: 'bg-blue-600 text-white',  inactive: 'text-zinc-600 hover:text-blue-600 hover:bg-blue-50' },
  { id: 'colecionador', label: 'Colecionador', active: 'bg-amber-500 text-white', inactive: 'text-zinc-600 hover:text-amber-600 hover:bg-amber-50' },
  { id: 'esportivo',    label: 'Esportivos',  active: 'bg-red-600 text-white',   inactive: 'text-zinc-600 hover:text-red-600 hover:bg-red-50' },
];

export default function Header({ selectedCategory = 'all', onCategoryChange }) {
  const [user, setUser] = useState(null);
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    db.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogin = () => setShowLoginModal(true);
  const handleLogout = () => { setMenuOpen(false); db.auth.logout('/'); };

  const handleFavoritos = () => {
    if (!user) { setShowLoginModal(true); return; }
    navigate('/Favoritos');
  };

  const avatar = user?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?';

  return (
    <>
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
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onCategoryChange?.(cat.id)}
                className={cn("px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200", selectedCategory === cat.id ? cat.active : cat.inactive)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">

            {/* Favoritos */}
            <button
              onClick={handleFavoritos}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl hover:bg-zinc-100 transition-colors text-zinc-600 hover:text-zinc-900"
            >
              <Heart className="w-5 h-5" />
              <span className="text-[10px] font-medium">Favoritos</span>
            </button>

            {/* Alertas */}
            <AlertsPopover />

            {/* Menu de perfil / Entrar */}
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(o => !o)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-xl transition-colors",
                    menuOpen ? "bg-zinc-100" : "hover:bg-zinc-100"
                  )}
                >
                  <div className="w-7 h-7 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {avatar}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-semibold text-zinc-900 leading-tight truncate max-w-[80px]">
                      {user.full_name?.split(' ')[0] || 'Minha conta'}
                    </p>
                    <p className="text-[10px] text-zinc-400 leading-tight">Meu perfil</p>
                  </div>
                  <ChevronDown className={cn("w-3.5 h-3.5 text-zinc-400 transition-transform", menuOpen && "rotate-180")} />
                </button>

                {/* Dropdown */}
                {menuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-zinc-200 py-2 z-50">
                    {/* Info do usuário */}
                    <div className="px-4 py-2 border-b border-zinc-100 mb-1">
                      <p className="text-xs font-semibold text-zinc-900 truncate">{user.full_name || 'Usuário'}</p>
                      <p className="text-[10px] text-zinc-400 truncate">{user.email}</p>
                    </div>

                    {/* Dashboard (só admins) */}
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Link>
                    )}

                    {/* Minhas informações */}
                    <Link
                      to="/Perfil"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
                    >
                      <User className="w-4 h-4 text-zinc-400" />
                      Minhas informações
                    </Link>

                    {/* Meus anúncios */}
                    <Link
                      to="/MeusAnuncios"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
                    >
                      <LayoutList className="w-4 h-4 text-zinc-400" />
                      Meus anúncios
                    </Link>

                    {/* Favoritos */}
                    <Link
                      to="/Favoritos"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
                    >
                      <Heart className="w-4 h-4 text-zinc-400" />
                      Favoritos
                    </Link>

                    <div className="border-t border-zinc-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sair
                      </button>
                    </div>
                  </div>
                )}
              </div>
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

    <LoginModal
      open={showLoginModal}
      onClose={() => setShowLoginModal(false)}
      onSuccess={() => { setShowLoginModal(false); db.auth.me().then(setUser).catch(() => setUser(null)); }}
    />
    </>
  );
}
