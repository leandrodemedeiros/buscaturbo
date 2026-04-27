import { db } from '@/lib/db';

import React, { useState } from 'react';
import { X, LogIn, UserPlus, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

const inputClass = "w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-1 focus:ring-red-100 bg-white";

export default function LoginModal({ open, onClose, onSuccess }) {
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = () => {
    // Redirect to platform login, returning to current page
    db.auth.redirectToLogin(window.location.href);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <div>
            <h2 className="font-bold text-zinc-900">Acesso necessário</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Planos profissionais requerem uma conta</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-100">
            <X className="w-4 h-4 text-zinc-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-4">
          <div className="bg-red-50 border border-red-100 rounded-xl p-4">
            <p className="text-sm text-zinc-700 leading-relaxed">
              Para assinar um plano profissional, você precisa fazer <strong>login</strong> ou <strong>criar uma conta</strong> no BuscaTurbo. Após entrar, você retornará para continuar seu anúncio.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleLogin}
              className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl h-11 gap-2 font-semibold"
            >
              <LogIn className="w-4 h-4" />
              Entrar / Criar conta
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full rounded-xl h-11"
            >
              Continuar sem conta (plano grátis)
            </Button>
          </div>
        </div>

        <div className="px-6 pb-5 text-center text-xs text-zinc-400">
          🔒 Seus dados preenchidos serão mantidos após o login.
        </div>
      </div>
    </div>
  );
}