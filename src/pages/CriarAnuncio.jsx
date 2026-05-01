import { db } from '@/lib/db';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Upload, X, Eye, Send, CheckSquare, Square, Car, Star, Building2, Crown, Check, LogIn, Phone, Zap, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from 'react-router-dom';

import { cn } from "@/lib/utils";
import LoginModal from '@/components/auth/LoginModal';

const CAR_BRANDS = [
  { name: 'Abarth' }, { name: 'Acura' }, { name: 'Alfa Romeo' }, { name: 'Aston Martin' },
  { name: 'Audi' }, { name: 'Bentley' }, { name: 'BMW' }, { name: 'Bugatti' }, { name: 'BYD' },
  { name: 'Cadillac' }, { name: 'Chevrolet' }, { name: 'Chrysler' }, { name: 'Citroën' },
  { name: 'Dodge' }, { name: 'Ferrari' }, { name: 'Fiat' }, { name: 'Ford' }, { name: 'Genesis' },
  { name: 'Honda' }, { name: 'Hyundai' }, { name: 'Jaguar' }, { name: 'Jeep' }, { name: 'Kia' },
  { name: 'Lamborghini' }, { name: 'Land Rover' }, { name: 'Lexus' }, { name: 'Maserati' },
  { name: 'Mazda' }, { name: 'McLaren' }, { name: 'Mercedes-Benz' }, { name: 'Mini' },
  { name: 'Mitsubishi' }, { name: 'Nissan' }, { name: 'Peugeot' }, { name: 'Porsche' },
  { name: 'RAM' }, { name: 'Renault' }, { name: 'Rolls-Royce' }, { name: 'Subaru' },
  { name: 'Suzuki' }, { name: 'Tesla' }, { name: 'Toyota' }, { name: 'Volkswagen' }, { name: 'Volvo' },
];

const MODELS_BY_BRAND = {
  'Chevrolet': ['Onix', 'Onix Plus', 'Tracker', 'Cruze', 'S10', 'Montana', 'Equinox', 'Blazer'],
  'Volkswagen': ['Gol', 'Polo', 'Virtus', 'T-Cross', 'Taos', 'Tiguan', 'Nivus', 'Jetta', 'Saveiro', 'Amarok'],
  'Fiat': ['Argo', 'Cronos', 'Mobi', 'Pulse', 'Fastback', 'Toro', 'Strada', 'Doblò', 'Uno'],
  'Toyota': ['Corolla', 'Yaris', 'Hilux', 'SW4', 'RAV4', 'Camry', 'Supra', 'GR86', 'Land Cruiser', 'Prius'],
  'Honda': ['Civic', 'HR-V', 'CR-V', 'Fit', 'WR-V', 'City', 'Accord'],
  'Hyundai': ['HB20', 'HB20S', 'Creta', 'Tucson', 'Santa Fe', 'i30', 'Ioniq 5'],
  'Ford': ['Ka', 'EcoSport', 'Ranger', 'Bronco', 'Mustang', 'F-150', 'Territory', 'Maverick'],
  'Jeep': ['Renegade', 'Compass', 'Commander', 'Wrangler', 'Gladiator'],
  'BMW': ['Série 3', 'Série 5', 'Série 7', 'X1', 'X3', 'X5', 'M3', 'M5', 'i4', 'iX'],
  'Mercedes-Benz': ['Classe A', 'Classe C', 'Classe E', 'Classe S', 'GLA', 'GLC', 'GLE', 'AMG GT'],
  'Audi': ['A3', 'A4', 'A6', 'Q3', 'Q5', 'Q7', 'TT', 'R8', 'e-tron', 'RS3', 'RS6'],
  'Nissan': ['Kicks', 'Versa', 'Sentra', 'Frontier', 'Leaf', 'GT-R'],
  'Renault': ['Kwid', 'Sandero', 'Logan', 'Duster', 'Captur', 'Oroch'],
  'Porsche': ['911', 'Cayenne', 'Macan', 'Panamera', 'Taycan', 'Boxster', 'Cayman'],
  'Ferrari': ['Roma', 'SF90', 'F8', '296 GTB', '812', 'Portofino'],
  'Lamborghini': ['Huracán', 'Urus', 'Revuelto'],
  'Tesla': ['Model 3', 'Model S', 'Model X', 'Model Y', 'Cybertruck'],
};

const PLANS = [
  {
    id: 'dono',
    icon: Car,
    name: 'Sou o Dono',
    tagline: 'Para quem vende o próprio veículo',
    priceLabel: 'Grátis',
    color: 'border-zinc-300',
    selectedColor: 'border-zinc-900 ring-2 ring-zinc-900/20',
    iconBg: 'bg-zinc-100',
    iconColor: 'text-zinc-700',
    ctaLabel: 'Continuar grátis',
    ctaClass: 'bg-zinc-900 hover:bg-zinc-700 text-white',
    features: ['1 anúncio ativo por CPF', 'Publicação por tempo indeterminado', 'Fotos do veículo', 'Contato direto com interessados'],
    isPro: false,
  },
  {
    id: 'vendedor',
    icon: Star,
    name: 'Vendedor',
    tagline: 'Venda com mais frequência',
    priceLabel: 'R$ 59,90/mês',
    color: 'border-blue-300',
    selectedColor: 'border-blue-600 ring-2 ring-blue-200',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    ctaLabel: 'Assinar Vendedor',
    ctaClass: 'bg-blue-600 hover:bg-blue-700 text-white',
    features: ['Até 3 anúncios por CPF', 'Cadastro do chassi obrigatório', 'Publicação por tempo indeterminado', 'Fotos do veículo'],
    isPro: true,
  },
  {
    id: 'agencia',
    icon: Building2,
    name: 'Agência',
    tagline: 'Para revendedoras',
    priceLabel: 'R$ 89,90/mês',
    color: 'border-amber-300',
    selectedColor: 'border-amber-500 ring-2 ring-amber-200',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    ctaLabel: 'Assinar Agência',
    ctaClass: 'bg-amber-500 hover:bg-amber-600 text-white',
    badge: 'Popular',
    features: ['Até 10 anúncios ativos', '2 destaques simultâneos (10 dias)', 'Página exclusiva com marca da loja', 'Anúncios extras por R$ 10,00 cada'],
    isPro: true,
  },
  {
    id: 'concessionaria',
    icon: Crown,
    name: 'Concessionária',
    tagline: 'Para grandes operações',
    priceLabel: 'R$ 349,00/mês',
    color: 'border-red-300',
    selectedColor: 'border-red-600 ring-2 ring-red-200',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    ctaLabel: 'Assinar Concessionária',
    ctaClass: 'bg-red-600 hover:bg-red-700 text-white',
    features: ['Anúncios ilimitados', 'Suporte a vídeos nos anúncios', '5 destaques simultâneos (15 dias)', 'Relatórios de desempenho', 'Atendimento prioritário'],
    isPro: true,
  },
];

const inputClass = "w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-1 focus:ring-red-100 bg-white";
const selectClass = "w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-red-400 bg-white appearance-none";

function Field({ label, children, required }) {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function CheckboxField({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <button type="button" onClick={() => onChange(!checked)} className="flex-shrink-0">
        {checked ? <CheckSquare className="w-5 h-5 text-red-600" /> : <Square className="w-5 h-5 text-zinc-400" />}
      </button>
      <span className="text-sm text-zinc-700">{label}</span>
    </label>
  );
}

const STEPS = ['Dados do veículo', 'Fotos & Descrição', 'Destacar anúncio'];

export default function CriarAnuncio() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [plan, setPlan] = useState('dono');
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [pendingPlan, setPendingPlan] = useState(null);
  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    sellerName: '',
    title: '',
    vehicleType: '',
    yearFab: '',
    yearModel: '',
    brand: '',
    model: '',
    price: '',
    phone: '',
    cpf: '',
    chassis: '',
    description: '',
    showPhone: false,
    hasHistory: false,
    images: [],
  });

  useEffect(() => {
    db.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));
  const availableModels = MODELS_BY_BRAND[form.brand] || [];

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    const uploaded = [];
    for (const file of files) {
      const { file_url } = await db.integrations.Core.UploadFile({ file });
      uploaded.push(file_url);
    }
    set('images', [...form.images, ...uploaded]);
    setUploading(false);
  };

  const handlePreview = () => {
    const brand = form.brand || '—';
    const model = form.model || '—';
    const year = form.yearModel || form.yearFab || '—';
    const price = form.price ? `R$ ${form.price}` : '—';
    const images = form.images.length > 0
      ? form.images.map(url => `<img src="${url}" style="width:100%;max-height:340px;object-fit:cover;border-radius:12px;margin-bottom:12px;" />`).join('')
      : `<div style="width:100%;height:240px;background:#f4f4f5;border-radius:12px;display:flex;align-items:center;justify-content:center;color:#a1a1aa;font-size:14px;margin-bottom:12px;">Sem fotos</div>`;
    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>${form.title || 'Anúncio'} – BuscaTurbo</title><style>body{font-family:system-ui,sans-serif;margin:0;background:#f9f9f9;color:#18181b}.container{max-width:720px;margin:0 auto;padding:24px 16px}h1{font-size:22px;font-weight:800;margin:0 0 8px}.meta{display:flex;gap:16px;font-size:14px;color:#71717a;margin-bottom:20px}.price{font-size:28px;font-weight:900;color:#dc2626;margin:12px 0 20px}.desc{font-size:15px;line-height:1.6;color:#3f3f46;background:white;padding:16px;border-radius:12px}.badge{display:inline-block;background:#fef2f2;color:#dc2626;padding:4px 12px;border-radius:99px;font-size:12px;font-weight:700;margin-bottom:16px}</style></head><body><div class="container"><span class="badge">Pré-visualização</span>${images}<h1>${form.title || 'Título não informado'}</h1><div class="meta"><span>${brand} ${model}</span><span>${year}</span></div><div class="price">${price}</div>${form.description ? `<div class="desc">${form.description.replace(/\n/g,'<br/>')}</div>` : ''}</div></body></html>`;
    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
  };

  const handlePlanSelect = (p) => {
    if (p.isPro && !user) {
      setPendingPlan(p.id);
      setLoginModalOpen(true);
    } else {
      setPlan(p.id);
    }
  };

  const handleLoginSuccess = (loggedUser) => {
    setUser(loggedUser);
    setLoginModalOpen(false);
    if (pendingPlan) {
      setPlan(pendingPlan);
      setPendingPlan(null);
    }
  };

  const handleSubmit = async (highlightPlan = null) => {
    setSubmitting(true);
    try {
      const code = 'BT-' + Math.random().toString(36).substring(2, 9).toUpperCase();
      const vehicle = await db.entities.Vehicle.create({
        title: form.title,
        brand: form.brand,
        model: form.model,
        year_fabrication: parseInt(form.yearFab) || undefined,
        year_model: parseInt(form.yearModel) || undefined,
        price: parseFloat(form.price.replace(/\D/g, '')) || 0,
        images: form.images,
        category: 'passeio',
      });

      // Se escolheu destacar, redireciona para pagamento
      if (highlightPlan && vehicle?.id) {
        navigate(`/DestacarAnuncio?vehicle_id=${vehicle.id}&plan=${highlightPlan}`);
        return;
      }

      // Sem destaque — vai para página de confirmação
      const params = new URLSearchParams({
        codigo: code,
        titulo: form.title,
        marca: form.brand,
        modelo: form.model,
        preco: form.price,
        imagem: form.images[0] || '',
        email: user?.email || '',
      });
      navigate('/AnuncioPublicado?' + params.toString());
    } finally {
      setSubmitting(false);
    }
  };

  const canGoNext0 = form.title && form.brand && form.price && form.cpf && form.sellerName;
  const selectedPlan = PLANS.find(p => p.id === plan);
  const canSubmit = canGoNext0 && (!selectedPlan?.isPro || form.chassis);

  return (
    <div className="min-h-screen bg-zinc-50 pb-16">
      {/* Nav */}
      <div className="bg-white border-b border-zinc-100 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors flex-shrink-0">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a1012fd10d7df3befc3b79/50ef0cf69_logobt.png"
            alt="BuscaTurbo"
            className="h-8 w-auto object-contain"
          />
          <div className="ml-auto flex items-center gap-2">
            {STEPS.map((s, i) => (
              <React.Fragment key={i}>
                <button
                  onClick={() => i < step && setStep(i)}
                  className={cn(
                    "flex items-center gap-1.5 text-xs font-semibold transition-colors",
                    i === step ? "text-red-600" : i < step ? "text-zinc-600 hover:text-zinc-900 cursor-pointer" : "text-zinc-300 cursor-default"
                  )}
                >
                  <span className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                    i === step ? "bg-red-600 text-white" : i < step ? "bg-zinc-900 text-white" : "bg-zinc-200 text-zinc-400"
                  )}>
                    {i < step ? <Check className="w-3 h-3" /> : i + 1}
                  </span>
                  <span className="hidden sm:inline">{s}</span>
                </button>
                {i < STEPS.length - 1 && <div className="w-6 h-px bg-zinc-200" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-8">

        {/* STEP 0 — Dados do veículo */}
        {step === 0 && (
          <div className="space-y-6">
            <h1 className="text-2xl font-black text-zinc-900">Dados do veículo</h1>

            {/* Login banner */}
            {!user && (
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-zinc-800">Já tem uma conta?</p>
                  <p className="text-xs text-zinc-500 mt-0.5">Faça login para gerenciar seus anúncios e acessar planos profissionais.</p>
                </div>
                <Button
                  onClick={() => setLoginModalOpen(true)}
                  variant="outline"
                  className="flex-shrink-0 rounded-xl gap-2 border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  <LogIn className="w-4 h-4" /> Entrar
                </Button>
              </div>
            )}

            {/* Pro info */}
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-sm text-zinc-600 leading-relaxed">
              Para anunciar como profissional ou empresa, é necessária uma assinatura.{' '}
              <Link to="/Planos" className="text-red-600 font-semibold hover:underline">Selecione um dos planos na página de planos</Link>.
            </div>

            <div className="bg-white rounded-2xl border border-zinc-100 p-6 space-y-5">
              <Field label="Nome do anunciante ou loja" required>
                <input className={inputClass} placeholder="Ex: João Silva ou Auto Peças Silva" value={form.sellerName} onChange={e => set('sellerName', e.target.value)} />
              </Field>

              <Field label="CPF do anunciante" required>
                <input
                  className={inputClass}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  value={form.cpf}
                  onChange={e => {
                    let v = e.target.value.replace(/\D/g, '');
                    if (v.length > 11) v = v.slice(0, 11);
                    v = v.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                    set('cpf', v);
                  }}
                />
                <p className="text-xs text-zinc-400 mt-1">Não será exibido publicamente. Usado para limitar anúncios por plano.</p>
              </Field>

              <Field label="Telefone de contato">
                <input
                  className={inputClass}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                  value={form.phone}
                  onChange={e => {
                    let v = e.target.value.replace(/\D/g, '');
                    if (v.length > 11) v = v.slice(0, 11);
                    if (v.length > 6) v = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
                    else if (v.length > 2) v = `(${v.slice(0,2)}) ${v.slice(2)}`;
                    set('phone', v);
                  }}
                />
              </Field>

              <Field label="Título do anúncio" required>
                <input className={inputClass} placeholder="Ex: Honda Civic EX 2022 Impecável" value={form.title} onChange={e => set('title', e.target.value)} />
              </Field>

              <Field label="Tipo de veículo" required>
                <select className={selectClass} value={form.vehicleType} onChange={e => set('vehicleType', e.target.value)}>
                  <option value="">Selecione...</option>
                  <option value="carro">Carro</option>
                  <option value="moto">Moto</option>
                </select>
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Ano de fabricação">
                  <input className={inputClass} type="number" min={1960} max={2025} placeholder="Ex: 2022" value={form.yearFab} onChange={e => set('yearFab', e.target.value)} />
                </Field>
                <Field label="Ano do modelo">
                  <input className={inputClass} type="number" min={1960} max={2026} placeholder="Ex: 2023" value={form.yearModel} onChange={e => set('yearModel', e.target.value)} />
                </Field>
              </div>

              <Field label="Marca" required>
                <select className={selectClass} value={form.brand} onChange={e => { set('brand', e.target.value); set('model', ''); }}>
                  <option value="">Selecione a marca...</option>
                  {CAR_BRANDS.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
                </select>
              </Field>

              <Field label="Modelo" required>
                <select className={selectClass} value={form.model} onChange={e => set('model', e.target.value)} disabled={!form.brand}>
                  <option value="">{form.brand ? 'Selecione o modelo...' : 'Selecione a marca primeiro'}</option>
                  {availableModels.map(m => <option key={m} value={m}>{m}</option>)}
                  {form.brand && availableModels.length === 0 && <option value={form.brand + ' (outro)'}>Outro modelo</option>}
                </select>
              </Field>

              <Field label="Valor de venda (R$)" required>
                <input className={inputClass} placeholder="Ex: 85.000" value={form.price} onChange={e => set('price', e.target.value)} />
              </Field>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => setStep(1)}
                disabled={!canGoNext0}
                className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-8 gap-2"
              >
                Continuar <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 1 — Fotos & Descrição */}
        {step === 1 && (
          <div className="space-y-6">
            <h1 className="text-2xl font-black text-zinc-900">Fotos & Descrição</h1>

            <div className="bg-white rounded-2xl border border-zinc-100 p-6 space-y-5">
              <Field label="Fotos do veículo">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-300 rounded-xl cursor-pointer hover:border-red-400 hover:bg-red-50/30 transition-colors">
                  <Upload className="w-6 h-6 text-zinc-400 mb-1" />
                  <span className="text-sm text-zinc-500">{uploading ? 'Enviando...' : 'Clique para selecionar fotos'}</span>
                  <span className="text-xs text-zinc-400 mt-0.5">JPG, PNG — múltiplos arquivos aceitos</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} disabled={uploading} />
                </label>
                {form.images.length > 0 && (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {form.images.map((url, i) => (
                      <div key={i} className="relative group">
                        <img src={url} alt="" className="w-20 h-20 object-cover rounded-xl border border-zinc-200" />
                        <button
                          onClick={() => set('images', form.images.filter((_, idx) => idx !== i))}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </Field>

              <Field label="Descrição do anúncio">
                <textarea
                  className={`${inputClass} h-28 resize-none`}
                  placeholder="Descreva o estado do veículo, revisões, extras, histórico..."
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                />
              </Field>

              <div className="space-y-3 pt-1">
                <CheckboxField
                  checked={form.showPhone}
                  onChange={v => set('showPhone', v)}
                  label="Exibir meu telefone no anúncio"
                />
                <CheckboxField
                  checked={form.hasHistory}
                  onChange={v => set('hasHistory', v)}
                  label="Possui histórico veicular (laudo, revisões documentadas)"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => setStep(0)} className="rounded-xl gap-2">
                <ArrowLeft className="w-4 h-4" /> Voltar
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handlePreview} className="rounded-xl gap-2">
                  <Eye className="w-4 h-4" /> Pré-visualizar
                </Button>
                <Button onClick={() => setStep(2)} className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-8 gap-2">
                  Continuar <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 — Destacar anúncio */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 text-sm font-semibold px-4 py-1.5 rounded-full">
                <Zap className="w-4 h-4" /> Último passo
              </div>
              <h1 className="text-2xl font-black text-zinc-900">Quer destacar seu anúncio?</h1>
              <p className="text-zinc-500 text-sm max-w-md mx-auto">
                Anúncios em destaque aparecem no topo das buscas e na página inicial, vendendo até 3x mais rápido.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 max-w-lg mx-auto">

              {/* Opção: Não destacar */}
              <div
                onClick={() => handleSubmit(null)}
                className="bg-white border-2 border-zinc-200 hover:border-zinc-400 rounded-2xl p-5 cursor-pointer transition-all flex items-center gap-4 group"
              >
                <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Send className="w-5 h-5 text-zinc-500" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-zinc-900">Publicar sem destaque</div>
                  <div className="text-xs text-zinc-500 mt-0.5">Grátis — apareço nos resultados normais</div>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600" />
              </div>

              {/* Opção: Destaque na Busca */}
              <div
                onClick={() => handleSubmit('busca')}
                className="bg-white border-2 border-blue-200 hover:border-blue-400 rounded-2xl p-5 cursor-pointer transition-all flex items-center gap-4 group"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Star className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-zinc-900">Destaque na Busca</div>
                  <div className="text-xs text-zinc-500 mt-0.5">7 dias de destaque nos resultados de busca</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-black text-zinc-900 text-sm">R$ 29,90</div>
                  <div className="text-xs text-zinc-400">7 dias</div>
                </div>
              </div>

              {/* Opção: Destaque Home + Busca — Mais vendido */}
              <div
                onClick={() => handleSubmit('home_busca_7')}
                className="bg-white border-2 border-amber-300 hover:border-amber-500 rounded-2xl p-5 cursor-pointer transition-all flex items-center gap-4 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">
                  Mais vendido
                </div>
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-zinc-900">Destaque Home + Busca</div>
                  <div className="text-xs text-zinc-500 mt-0.5">7 dias na página inicial e nos resultados</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-black text-zinc-900 text-sm">R$ 49,90</div>
                  <div className="text-xs text-zinc-400">7 dias</div>
                </div>
              </div>

              {/* Opção: Destaque Premium */}
              <div
                onClick={() => handleSubmit('home_busca_15')}
                className="bg-white border-2 border-red-200 hover:border-red-400 rounded-2xl p-5 cursor-pointer transition-all flex items-center gap-4 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">
                  Maior alcance
                </div>
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Crown className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-zinc-900">Destaque Premium</div>
                  <div className="text-xs text-zinc-500 mt-0.5">15 dias com máxima visibilidade</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-black text-zinc-900 text-sm">R$ 69,90</div>
                  <div className="text-xs text-zinc-400">15 dias</div>
                </div>
              </div>

            </div>

            <div className="flex items-center justify-between max-w-lg mx-auto">
              <Button variant="outline" onClick={() => setStep(1)} className="rounded-xl gap-2">
                <ArrowLeft className="w-4 h-4" /> Voltar
              </Button>
              {submitting && (
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                  <Loader2 className="w-4 h-4 animate-spin" /> Publicando...
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <LoginModal
        open={loginModalOpen}
        onClose={() => { setLoginModalOpen(false); setPendingPlan(null); }}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
}