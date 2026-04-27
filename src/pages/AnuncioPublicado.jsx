import React, { useState } from 'react';
import { CheckCircle2, Copy, Check, Printer, ArrowLeft, Mail, KeyRound, RefreshCw, Pencil, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { Link } from 'react-router-dom';

function EditModal({ onClose }) {
  const [pin, setPin] = useState('');
  const [resent, setResent] = useState(false);

  const handleResend = () => {
    setResent(true);
    setTimeout(() => setResent(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-zinc-500" />
            <h2 className="font-bold text-zinc-900">Verificação de identidade</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-100">
            <X className="w-4 h-4 text-zinc-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-5">
          <p className="text-sm text-zinc-500 leading-relaxed">
            Uma senha numérica foi enviada para o e-mail cadastrado no anúncio. Digite-a abaixo para continuar.
          </p>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">Código numérico</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={pin}
              onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
              className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-center text-2xl font-mono font-bold tracking-widest outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
            />
          </div>

          <button
            onClick={handleResend}
            className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resent ? 'animate-spin' : ''}`} />
            {resent ? 'Código reenviado!' : 'Reenviar código por e-mail'}
          </button>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <Button
            className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl gap-2"
            disabled={pin.length < 4}
          >
            <Pencil className="w-4 h-4" />
            Continuar para edição
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AnuncioPublicado() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('codigo') || 'BT-' + Math.random().toString(36).substring(2, 9).toUpperCase();
  const title = params.get('titulo') || 'Veículo anunciado';
  const brand = params.get('marca') || '';
  const model = params.get('modelo') || '';
  const price = params.get('preco') || '';
  const imageUrl = params.get('imagem') || '';
  const email = params.get('email') || '';

  const [copied, setCopied] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => window.print();

  const formatPrice = (p) => {
    const num = parseFloat(p.replace(/\D/g, ''));
    if (isNaN(num)) return p;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="min-h-screen bg-zinc-50 print:bg-white">
      {/* Nav */}
      <div className="bg-white border-b border-zinc-100 print:hidden sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Voltar ao início
          </Link>
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a1012fd10d7df3befc3b79/50ef0cf69_logobt.png"
            alt="BuscaTurbo"
            className="h-8 w-auto object-contain"
          />
          <h1 className="font-bold text-zinc-900">Anúncio Publicado</h1>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" onClick={handlePrint} className="gap-2 rounded-xl">
              <Printer className="w-4 h-4" />
              Imprimir
            </Button>
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">

        {/* Success banner */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9 text-green-500" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900">Anúncio publicado com sucesso!</h1>
          <p className="text-zinc-500 text-sm max-w-md mx-auto">
            Seu veículo já está disponível no BuscaTurbo. Guarde o código abaixo para gerenciar seu anúncio.{' '}
            <strong className="text-zinc-700">Este código será enviado para o e-mail que você informou no cadastro.</strong>
          </p>
          {email && (
            <div className="flex items-center justify-center gap-2 text-sm text-zinc-400">
              <Mail className="w-4 h-4" />
              <span>{email}</span>
            </div>
          )}
        </div>

        {/* Ad code */}
        <div className="bg-white rounded-2xl border-2 border-green-200 shadow-sm p-8 text-center space-y-4">
          <p className="text-sm font-semibold text-zinc-500 uppercase tracking-widest">Código do anúncio</p>
          <div
            onClick={handleCopy}
            className="cursor-pointer select-all inline-flex items-center gap-4 bg-zinc-950 rounded-2xl px-8 py-5 group hover:bg-zinc-800 transition-colors"
          >
            <span className="font-mono font-black text-5xl tracking-widest text-green-400 leading-none print:text-4xl">
              {code}
            </span>
            <button className="text-green-400/60 group-hover:text-green-400 transition-colors print:hidden">
              {copied ? <Check className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
            </button>
          </div>
          <p className="text-xs text-zinc-400 print:hidden">
            {copied ? '✓ Código copiado!' : 'Clique para copiar o código'}
          </p>
        </div>

        {/* How to edit info */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl px-6 py-5 space-y-3 print:hidden">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Pencil className="w-4 h-4 text-blue-600" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-zinc-800 text-sm">Como editar seu anúncio</p>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Sempre que quiser editar um anúncio, pesquise por esse código na busca principal do site. Ao visualizar o anúncio, clique em <strong className="text-zinc-700">"Editar anúncio"</strong> e uma senha numérica será automaticamente enviada por e-mail.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => setEditModalOpen(true)}
            className="w-full rounded-xl gap-2 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300"
          >
            <Pencil className="w-4 h-4" />
            Simular edição do anúncio
          </Button>
        </div>

        {/* Preview card */}
        <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-zinc-100">
            <h2 className="text-sm font-bold uppercase tracking-wide text-zinc-400">Prévia do anúncio</h2>
          </div>

          {imageUrl ? (
            <div className="aspect-video overflow-hidden">
              <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="aspect-video bg-zinc-100 flex items-center justify-center text-zinc-300 text-sm">
              Sem foto principal
            </div>
          )}

          <div className="p-6 space-y-2">
            {(brand || model) && (
              <p className="text-sm text-zinc-400 font-medium">{brand} {model}</p>
            )}
            <h3 className="text-xl font-bold text-zinc-900">{title}</h3>
            {price && (
              <p className="text-2xl font-black text-red-600">{formatPrice(price)}</p>
            )}
            <div className="pt-4 flex items-center gap-2 text-xs text-zinc-400 border-t border-zinc-100">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              Anúncio ativo · Publicado agora · Gratuito
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div className="text-center text-sm text-zinc-400 print:hidden">
          🎉 Anúncios no <strong className="text-zinc-600">BuscaTurbo</strong> são <strong className="text-zinc-600">gratuitos</strong> e ficam disponíveis por tempo indeterminado.
        </div>
      </main>

      {editModalOpen && <EditModal onClose={() => setEditModalOpen(false)} />}
    </div>
  );
}