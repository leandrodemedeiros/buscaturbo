import React, { useState } from 'react';
import { Check, Star, Building2, Car, Crown, Zap, ArrowLeft, BadgePercent } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    id: 'dono',
    icon: Car,
    name: 'Sou o Dono',
    tagline: 'Para quem vende o próprio veículo',
    monthlyPrice: 0,
    color: 'border-zinc-200',
    headerBg: 'bg-zinc-50',
    iconColor: 'text-zinc-600',
    iconBg: 'bg-zinc-100',
    badge: null,
    features: [
      '1 anúncio ativo por CPF',
      'Publicação por tempo indeterminado',
      'Edição sem restrições',
      'Fotos do veículo',
      'Contato direto com interessados',
    ],
    cta: 'Anunciar gratuitamente',
    ctaClass: 'bg-zinc-900 hover:bg-zinc-700 text-white',
  },
  {
    id: 'vendedor',
    icon: Star,
    name: 'Vendedor',
    tagline: 'Para quem vende com mais frequência',
    monthlyPrice: 59.90,
    color: 'border-blue-300',
    headerBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
    badge: null,
    features: [
      'Até 3 anúncios por CPF',
      'Publicação por tempo indeterminado',
      'Edição de todos os dados (exceto chassi)',
      'Cadastro obrigatório do número do chassi',
      'Fotos do veículo',
    ],
    cta: 'Assinar Vendedor',
    ctaClass: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
  {
    id: 'agencia',
    icon: Building2,
    name: 'Agência de Veículos',
    tagline: 'Para revendedoras e agências',
    monthlyPrice: 89.90,
    color: 'border-amber-300',
    headerBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-100',
    badge: 'Popular',
    features: [
      'Até 10 anúncios ativos',
      '2 destaques simultâneos intercambiáveis (10 dias)',
      'Página exclusiva com marca da loja',
      'Anúncios adicionais por R$ 10,00 cada',
      'Publicação por tempo indeterminado',
      'Edição completa de todos os anúncios',
    ],
    cta: 'Assinar Agência',
    ctaClass: 'bg-amber-500 hover:bg-amber-600 text-white',
  },
  {
    id: 'concessionaria',
    icon: Crown,
    name: 'Concessionária',
    tagline: 'Para grandes operações',
    monthlyPrice: 349.00,
    color: 'border-red-300',
    headerBg: 'bg-red-50',
    iconColor: 'text-red-600',
    iconBg: 'bg-red-100',
    badge: 'Completo',
    features: [
      'Anúncios ilimitados',
      'Suporte a vídeos nos anúncios',
      '5 destaques simultâneos intercambiáveis (15 dias)',
      'Página exclusiva com identidade visual',
      'Relatórios de desempenho',
      'Atendimento prioritário',
    ],
    cta: 'Assinar Concessionária',
    ctaClass: 'bg-red-600 hover:bg-red-700 text-white',
  },
];

function PlanCard({ plan, billing }) {
  const Icon = plan.icon;
  const isMonthly = billing === 'monthly';
  const price = plan.monthlyPrice;
  const annualPrice = price > 0 ? price * 12 * 0.9 : 0;
  const monthlyFromAnnual = price > 0 ? annualPrice / 12 : 0;

  return (
    <div className={cn(
      "relative bg-white rounded-2xl border-2 overflow-hidden flex flex-col",
      plan.color,
      plan.badge === 'Popular' && "ring-2 ring-amber-400 ring-offset-2"
    )}>
      {plan.badge && (
        <div className="absolute top-4 right-4">
          <span className={cn(
            "text-xs font-bold px-2.5 py-1 rounded-full",
            plan.badge === 'Popular' ? "bg-amber-500 text-white" : "bg-red-600 text-white"
          )}>
            {plan.badge}
          </span>
        </div>
      )}

      {/* Header */}
      <div className={cn("px-6 pt-6 pb-5", plan.headerBg)}>
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4", plan.iconBg)}>
          <Icon className={cn("w-6 h-6", plan.iconColor)} />
        </div>
        <h3 className="text-xl font-bold text-zinc-900">{plan.name}</h3>
        <p className="text-sm text-zinc-500 mt-0.5">{plan.tagline}</p>

        {/* Pricing */}
        <div className="mt-4">
          {price === 0 ? (
            <div className="text-3xl font-black text-zinc-900">Grátis</div>
          ) : (
            <div>
              {isMonthly ? (
                <>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-black text-zinc-900">
                      {price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                    <span className="text-sm text-zinc-500 mb-1">/mês</span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    ou {(price * 12 * 0.9).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/ano (10% off)
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-black text-zinc-900">
                      {monthlyFromAnnual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                    <span className="text-sm text-zinc-500 mb-1">/mês</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <BadgePercent className="w-3.5 h-3.5 text-green-600" />
                    <p className="text-xs text-green-600 font-semibold">
                      {annualPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/ano — você economiza {(price * 12 * 0.1).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Features */}
      <div className="px-6 py-5 flex-1 space-y-3">
        {plan.features.map((f, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-zinc-700">{f}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="px-6 pb-6">
        <Button className={cn("w-full rounded-xl h-11 font-semibold", plan.ctaClass)}>
          {plan.cta}
        </Button>
      </div>
    </div>
  );
}

export default function Planos() {
  const [billing, setBilling] = useState('monthly');

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Nav */}
      <div className="bg-white border-b border-zinc-100 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a1012fd10d7df3befc3b79/50ef0cf69_logobt.png"
            alt="BuscaTurbo"
            className="h-8 w-auto object-contain"
          />
          <h1 className="font-bold text-zinc-900">Planos</h1>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-12 space-y-10">
        {/* Hero */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 text-sm font-semibold px-4 py-1.5 rounded-full">
            <Zap className="w-4 h-4" />
            Planos BuscaTurbo
          </div>
          <h2 className="text-4xl font-black text-zinc-900">Escolha o plano ideal para você</h2>
          <p className="text-zinc-500 max-w-xl mx-auto">
            Do particular à concessionária, temos o plano certo para maximizar suas vendas de veículos.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center">
          <div className="bg-white border border-zinc-200 rounded-xl p-1 flex gap-1">
            <button
              onClick={() => setBilling('monthly')}
              className={cn(
                "px-5 py-2 rounded-lg text-sm font-semibold transition-all",
                billing === 'monthly'
                  ? "bg-zinc-900 text-white shadow"
                  : "text-zinc-600 hover:text-zinc-900"
              )}
            >
              Mensal
            </button>
            <button
              onClick={() => setBilling('annual')}
              className={cn(
                "px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2",
                billing === 'annual'
                  ? "bg-zinc-900 text-white shadow"
                  : "text-zinc-600 hover:text-zinc-900"
              )}
            >
              Anual
              <span className={cn(
                "text-xs px-1.5 py-0.5 rounded-full font-bold",
                billing === 'annual' ? "bg-green-400 text-zinc-900" : "bg-green-100 text-green-700"
              )}>
                -10%
              </span>
            </button>
          </div>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLANS.map(plan => (
            <PlanCard key={plan.id} plan={plan} billing={billing} />
          ))}
        </div>

        {/* Highlight upsell */}
        <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-2xl p-8 text-white text-center space-y-4">
          <Zap className="w-10 h-10 mx-auto opacity-80" />
          <h2 className="text-2xl font-black">Quer dar mais visibilidade ao seu anúncio?</h2>
          <p className="text-red-100 max-w-lg mx-auto">
            Independente do seu plano, você pode destacar qualquer anúncio por um período e aparecer no topo das buscas.
          </p>
          <Link to={createPageUrl('DestacarAnuncio')}>
            <Button className="bg-white text-red-600 hover:bg-red-50 font-bold rounded-xl px-8 h-11 mt-2">
              Ver opções de destaque
            </Button>
          </Link>
        </div>

        {/* FAQ highlights */}
        <div className="grid md:grid-cols-3 gap-6 pb-6">
          {[
            { title: 'Pagamento seguro', desc: 'Todos os pagamentos são processados com criptografia e segurança.' },
            { title: 'Cancele quando quiser', desc: 'Sem fidelidade. Cancele ou mude de plano a qualquer momento.' },
            { title: 'Suporte dedicado', desc: 'Nossa equipe está disponível para ajudar você a vender mais rápido.' },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-xl border border-zinc-100 p-5">
              <h3 className="font-bold text-zinc-900 mb-1">{item.title}</h3>
              <p className="text-sm text-zinc-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}