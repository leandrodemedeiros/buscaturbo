import React, { useState, useEffect } from 'react';
import { Zap, Star, Crown, ArrowLeft, Check, CreditCard, ChevronDown, ChevronUp, Info, Loader2, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link, useSearchParams } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { supabase } from '@/lib/supabase';

const HIGHLIGHT_PLANS = [
  {
    id: 'busca',
    icon: Star,
    name: 'Destaque na Busca',
    days: 7,
    price: 29.90,
    color: 'border-blue-300',
    headerBg: 'bg-blue-50',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    badge: null,
    installments: null,
    description: 'Seu anúncio aparece em destaque nos resultados de busca de veículos do mesmo tipo, marca ou região.',
    features: ['Destaque nos resultados de busca','Visibilidade por tipo de veículo','Visibilidade por marca','Visibilidade por região','Validade de 7 dias'],
  },
  {
    id: 'home_busca_7',
    icon: Zap,
    name: 'Destaque Home + Busca',
    days: 7,
    price: 49.90,
    color: 'border-amber-300',
    headerBg: 'bg-amber-50',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    badge: 'Mais vendido',
    installments: { free: 2, withFee: 12, feePercent: 2.99 },
    description: 'Destaque na página inicial e nos resultados de busca por tipo, marca ou região do veículo.',
    features: ['Destaque na página inicial','Destaque nos resultados de busca','Visibilidade por tipo, marca e região','Validade de 7 dias','Parcelamento em até 2x sem juros'],
  },
  {
    id: 'home_busca_15',
    icon: Crown,
    name: 'Destaque Premium',
    days: 15,
    price: 69.90,
    color: 'border-red-300',
    headerBg: 'bg-red-50',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    badge: 'Maior alcance',
    installments: { free: 2, withFee: 12, feePercent: 2.99 },
    description: 'Máxima visibilidade na página inicial e em toda busca relacionada ao veículo, por 15 dias.',
    features: ['Destaque na página inicial','Destaque nos resultados de busca','Visibilidade por tipo, marca e região','Validade de 15 dias','Parcelamento em até 2x sem juros'],
  },
];

function InstallmentInfo({ plan, installments }) {
  const [open, setOpen] = useState(false);
  if (!installments) return null;
  const options = [];
  for (let n = 1; n <= installments.withFee; n++) {
    let total = plan.price;
    if (n > installments.free) total = plan.price * Math.pow(1 + installments.feePercent / 100, n - installments.free);
    options.push({ n, perMonth: total / n, total, hasFee: n > installments.free });
  }
  return (
    <div className="mt-3">
      <button onClick={() => setOpen(o => !o)} className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-700 transition-colors">
        <Info className="w-3.5 h-3.5" />
        Ver opções de parcelamento
        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>
      {open && (
        <div className="mt-2 bg-zinc-50 rounded-xl border border-zinc-200 divide-y divide-zinc-100 text-xs overflow-hidden">
          {options.map(opt => (
            <div key={opt.n} className={cn("flex items-center justify-between px-3 py-2", !opt.hasFee && "text-green-700 font-medium")}>
              <span>{opt.n}x de {opt.perMonth.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              <span className={opt.hasFee ? "text-zinc-400" : "text-green-600"}>
                {opt.hasFee ? `Total: ${opt.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} (+${installments.feePercent}% a.m.)` : 'Sem juros'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PlanCard({ plan, selected, onSelect }) {
  const Icon = plan.icon;
  return (
    <div onClick={() => onSelect(plan.id)} className={cn("relative bg-white rounded-2xl border-2 overflow-hidden flex flex-col cursor-pointer transition-all duration-200", selected ? "border-red-500 ring-2 ring-red-200 shadow-lg" : plan.color + " hover:shadow-md", plan.badge === 'Mais vendido' && !selected && "ring-2 ring-amber-300 ring-offset-1")}>
      {plan.badge && (
        <div className="absolute top-4 right-4">
          <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full", plan.badge === 'Mais vendido' ? "bg-amber-500 text-white" : "bg-red-600 text-white")}>{plan.badge}</span>
        </div>
      )}
      <div className={cn("px-6 pt-6 pb-5", plan.headerBg)}>
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4", plan.iconBg)}>
          <Icon className={cn("w-6 h-6", plan.iconColor)} />
        </div>
        <h3 className="text-lg font-bold text-zinc-900">{plan.name}</h3>
        <p className="text-sm text-zinc-500 mt-0.5 pr-12">{plan.description}</p>
        <div className="mt-4 flex items-end gap-1">
          <span className="text-3xl font-black text-zinc-900">{plan.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
          <span className="text-sm text-zinc-500 mb-1">/ {plan.days} dias</span>
        </div>
        {plan.installments && <p className="text-xs text-zinc-400 mt-1">ou 2x de {(plan.price / 2).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} sem juros</p>}
      </div>
      <div className="px-6 py-5 flex-1 space-y-2.5">
        {plan.features.map((f, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-zinc-700">{f}</span>
          </div>
        ))}
        <InstallmentInfo plan={plan} installments={plan.installments} />
      </div>
      <div className="px-6 pb-6">
        <div className={cn("w-full h-10 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-colors", selected ? "bg-red-600 text-white" : "bg-zinc-100 text-zinc-700")}>
          {selected ? <><Check className="w-4 h-4" /> Selecionado</> : 'Selecionar'}
        </div>
      </div>
    </div>
  );
}

// ── Tela de retorno do pagamento ──
function PaymentStatus({ status, onTryAgain }) {
  if (status === 'success') return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle className="w-10 h-10 text-green-600" />
      </div>
      <div>
        <h2 className="text-2xl font-black text-zinc-900">Destaque ativado!</h2>
        <p className="text-zinc-500 mt-2">Seu anúncio já está em posição privilegiada. O destaque pode levar alguns minutos para aparecer.</p>
      </div>
      <Link to="/MeusAnuncios" className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-8 py-3 font-semibold transition-colors">Ver meus anúncios</Link>
    </div>
  );
  if (status === 'pending') return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
      <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
        <Clock className="w-10 h-10 text-yellow-600" />
      </div>
      <div>
        <h2 className="text-2xl font-black text-zinc-900">Pagamento em processamento</h2>
        <p className="text-zinc-500 mt-2">Seu pagamento está sendo processado. O destaque será ativado automaticamente quando confirmado.</p>
      </div>
      <Link to="/MeusAnuncios" className="bg-zinc-800 hover:bg-zinc-900 text-white rounded-xl px-8 py-3 font-semibold transition-colors">Ver meus anúncios</Link>
    </div>
  );
  if (status === 'failure') return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
        <XCircle className="w-10 h-10 text-red-600" />
      </div>
      <div>
        <h2 className="text-2xl font-black text-zinc-900">Pagamento não aprovado</h2>
        <p className="text-zinc-500 mt-2">Não foi possível processar o pagamento. Verifique os dados e tente novamente.</p>
      </div>
      <button onClick={onTryAgain} className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-8 py-3 font-semibold transition-colors">Tentar novamente</button>
    </div>
  );
  return null;
}

export default function DestacarAnuncio() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selected, setSelected] = useState('home_busca_7');
  const [installments, setInstallments] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const paymentStatus = searchParams.get('status');
  const vehicleIdFromUrl = searchParams.get('vehicle_id');

  // Pré-selecionar veículo se veio da página de anúncios
  const [vehicleId, setVehicleId] = useState(vehicleIdFromUrl || '');

  useEffect(() => {
    if (vehicleIdFromUrl) setVehicleId(vehicleIdFromUrl);
  }, [vehicleIdFromUrl]);

  const plan = HIGHLIGHT_PLANS.find(p => p.id === selected);
  const maxFreeInstallments = plan?.installments?.free ?? 1;
  const maxInstallments = plan?.installments?.withFee ?? 1;
  const feePercent = plan?.installments?.feePercent ?? 0;

  const getTotal = () => {
    if (!plan) return 0;
    if (installments <= maxFreeInstallments) return plan.price;
    return plan.price * Math.pow(1 + feePercent / 100, installments - maxFreeInstallments);
  };

  const total = getTotal();
  const perMonth = total / installments;

  const handlePay = async () => {
    if (!vehicleId) { setError('Nenhum anúncio selecionado. Acesse esta página pelo botão "Destacar" no seu anúncio.'); return; }
    setError('');
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Você precisa estar logado para continuar.');

      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-mp-preference`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ vehicle_id: vehicleId, plan_id: selected, installments }),
      });

      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Erro ao criar preferência de pagamento');

      // Em produção usa init_point, em sandbox usa sandbox_init_point
      const payUrl = import.meta.env.VITE_MP_SANDBOX === 'true' ? data.sandbox_init_point : data.init_point;
      window.location.href = payUrl;

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Mostrar tela de retorno se voltou do MP
  if (paymentStatus) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <div className="bg-white border-b border-zinc-100 sticky top-0 z-30">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </Link>
          </div>
        </div>
        <PaymentStatus status={paymentStatus} onTryAgain={() => setSearchParams({})} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="bg-white border-b border-zinc-100 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
          <h1 className="font-bold text-zinc-900">Destaque de Anúncio</h1>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-12 space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 text-sm font-semibold px-4 py-1.5 rounded-full">
            <Zap className="w-4 h-4" /> Destaque seu anúncio
          </div>
          <h2 className="text-4xl font-black text-zinc-900">Venda mais rápido com destaque</h2>
          <p className="text-zinc-500 max-w-lg mx-auto">Seu anúncio aparece em posição privilegiada nos resultados de busca e na página inicial, aumentando as chances de venda.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {HIGHLIGHT_PLANS.map(p => <PlanCard key={p.id} plan={p} selected={selected === p.id} onSelect={setSelected} />)}
        </div>

        {plan && (
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 max-w-lg mx-auto space-y-5">
            <h2 className="font-bold text-zinc-900 text-lg">Resumo do pagamento</h2>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>}

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500">Plano selecionado</span>
                <span className="font-semibold text-zinc-900">{plan.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Duração</span>
                <span className="font-semibold text-zinc-900">{plan.days} dias</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Valor</span>
                <span className="font-semibold text-zinc-900">{plan.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
            </div>

            {plan.installments && (
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Parcelamento</label>
                <select value={installments} onChange={e => setInstallments(parseInt(e.target.value))} className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-red-400 bg-white">
                  {Array.from({ length: maxInstallments }, (_, i) => i + 1).map(n => {
                    const hasFee = n > maxFreeInstallments;
                    const t = hasFee ? plan.price * Math.pow(1 + feePercent / 100, n - maxFreeInstallments) : plan.price;
                    const pm = t / n;
                    return (
                      <option key={n} value={n}>
                        {n}x de {pm.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        {hasFee ? ` (+${feePercent}% a.m.) = ${t.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}` : ' sem juros'}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            <div className="pt-3 border-t border-zinc-100 flex justify-between items-center">
              <span className="text-sm text-zinc-500">Total</span>
              <div className="text-right">
                <div className="text-2xl font-black text-zinc-900">{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                {installments > 1 && <div className="text-xs text-zinc-400">{installments}x de {perMonth.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>}
              </div>
            </div>

            <Button onClick={handlePay} disabled={loading} className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-xl h-12 font-bold gap-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
              {loading ? 'Aguarde...' : 'Pagar e ativar destaque'}
            </Button>

            <p className="text-xs text-center text-zinc-400">🔒 Pagamento seguro via Mercado Pago. O destaque é ativado após a confirmação.</p>
          </div>
        )}
      </main>
    </div>
  );
}
