import { db } from '@/lib/db';

import React, { useState } from 'react';
import { X, Eye, Send, Upload, CheckSquare, Square, Zap } from 'lucide-react';
import { Button } from "@/components/ui/button";

import { createPageUrl } from "@/utils";
import { useNavigate } from 'react-router-dom';

const CAR_BRANDS = [
  { name: 'Abarth', logo: 'https://www.carlogos.org/car-logos/abarth-logo.png' },
  { name: 'Acura', logo: 'https://www.carlogos.org/car-logos/acura-logo.png' },
  { name: 'Alfa Romeo', logo: 'https://www.carlogos.org/car-logos/alfa-romeo-logo.png' },
  { name: 'Aston Martin', logo: 'https://www.carlogos.org/car-logos/aston-martin-logo.png' },
  { name: 'Audi', logo: 'https://www.carlogos.org/car-logos/audi-logo.png' },
  { name: 'Bentley', logo: 'https://www.carlogos.org/car-logos/bentley-logo.png' },
  { name: 'BMW', logo: 'https://www.carlogos.org/car-logos/bmw-logo.png' },
  { name: 'Bugatti', logo: 'https://www.carlogos.org/car-logos/bugatti-logo.png' },
  { name: 'BYD', logo: 'https://www.carlogos.org/car-logos/byd-logo.png' },
  { name: 'Cadillac', logo: 'https://www.carlogos.org/car-logos/cadillac-logo.png' },
  { name: 'Chevrolet', logo: 'https://www.carlogos.org/car-logos/chevrolet-logo.png' },
  { name: 'Chrysler', logo: 'https://www.carlogos.org/car-logos/chrysler-logo.png' },
  { name: 'Citroën', logo: 'https://www.carlogos.org/car-logos/citroen-logo.png' },
  { name: 'Dodge', logo: 'https://www.carlogos.org/car-logos/dodge-logo.png' },
  { name: 'Ferrari', logo: 'https://www.carlogos.org/car-logos/ferrari-logo.png' },
  { name: 'Fiat', logo: 'https://www.carlogos.org/car-logos/fiat-logo.png' },
  { name: 'Ford', logo: 'https://www.carlogos.org/car-logos/ford-logo.png' },
  { name: 'Genesis', logo: 'https://www.carlogos.org/car-logos/genesis-logo.png' },
  { name: 'Honda', logo: 'https://www.carlogos.org/car-logos/honda-logo.png' },
  { name: 'Hyundai', logo: 'https://www.carlogos.org/car-logos/hyundai-logo.png' },
  { name: 'Jaguar', logo: 'https://www.carlogos.org/car-logos/jaguar-logo.png' },
  { name: 'Jeep', logo: 'https://www.carlogos.org/car-logos/jeep-logo.png' },
  { name: 'Kia', logo: 'https://www.carlogos.org/car-logos/kia-logo.png' },
  { name: 'Lamborghini', logo: 'https://www.carlogos.org/car-logos/lamborghini-logo.png' },
  { name: 'Land Rover', logo: 'https://www.carlogos.org/car-logos/land-rover-logo.png' },
  { name: 'Lexus', logo: 'https://www.carlogos.org/car-logos/lexus-logo.png' },
  { name: 'Maserati', logo: 'https://www.carlogos.org/car-logos/maserati-logo.png' },
  { name: 'Mazda', logo: 'https://www.carlogos.org/car-logos/mazda-logo.png' },
  { name: 'McLaren', logo: 'https://www.carlogos.org/car-logos/mclaren-logo.png' },
  { name: 'Mercedes-Benz', logo: 'https://www.carlogos.org/car-logos/mercedes-benz-logo.png' },
  { name: 'Mini', logo: 'https://www.carlogos.org/car-logos/mini-logo.png' },
  { name: 'Mitsubishi', logo: 'https://www.carlogos.org/car-logos/mitsubishi-logo.png' },
  { name: 'Nissan', logo: 'https://www.carlogos.org/car-logos/nissan-logo.png' },
  { name: 'Peugeot', logo: 'https://www.carlogos.org/car-logos/peugeot-logo.png' },
  { name: 'Porsche', logo: 'https://www.carlogos.org/car-logos/porsche-logo.png' },
  { name: 'RAM', logo: 'https://www.carlogos.org/car-logos/ram-logo.png' },
  { name: 'Renault', logo: 'https://www.carlogos.org/car-logos/renault-logo.png' },
  { name: 'Rolls-Royce', logo: 'https://www.carlogos.org/car-logos/rolls-royce-logo.png' },
  { name: 'Subaru', logo: 'https://www.carlogos.org/car-logos/subaru-logo.png' },
  { name: 'Suzuki', logo: 'https://www.carlogos.org/car-logos/suzuki-logo.png' },
  { name: 'Tesla', logo: 'https://www.carlogos.org/car-logos/tesla-logo.png' },
  { name: 'Toyota', logo: 'https://www.carlogos.org/car-logos/toyota-logo.png' },
  { name: 'Volkswagen', logo: 'https://www.carlogos.org/car-logos/volkswagen-logo.png' },
  { name: 'Volvo', logo: 'https://www.carlogos.org/car-logos/volvo-logo.png' },
];

const MODELS_BY_BRAND = {
  'Chevrolet': ['Onix', 'Onix Plus', 'Tracker', 'Cruze', 'S10', 'Montana', 'Equinox', 'Blazer', 'Trailblazer', 'Spin', 'Cobalt'],
  'Volkswagen': ['Gol', 'Polo', 'Virtus', 'T-Cross', 'Taos', 'Tiguan', 'Nivus', 'Jetta', 'Saveiro', 'Amarok', 'Golf'],
  'Fiat': ['Argo', 'Cronos', 'Mobi', 'Pulse', 'Fastback', 'Toro', 'Strada', 'Doblò', 'Uno', 'Palio'],
  'Toyota': ['Corolla', 'Yaris', 'Hilux', 'SW4', 'RAV4', 'Camry', 'Supra', 'GR86', 'Land Cruiser', 'Prius'],
  'Honda': ['Civic', 'HR-V', 'CR-V', 'Fit', 'WR-V', 'City', 'Accord', 'Pilot', 'Ridgeline'],
  'Hyundai': ['HB20', 'HB20S', 'Creta', 'Tucson', 'Santa Fe', 'Sonata', 'i30', 'Ioniq 5', 'Ioniq 6'],
  'Ford': ['Ka', 'EcoSport', 'Ranger', 'Bronco', 'Mustang', 'F-150', 'Territory', 'Maverick', 'Edge'],
  'Jeep': ['Renegade', 'Compass', 'Commander', 'Wrangler', 'Gladiator', 'Cherokee', 'Grand Cherokee'],
  'BMW': ['Série 3', 'Série 5', 'Série 7', 'X1', 'X3', 'X5', 'M3', 'M5', 'i3', 'i4', 'iX'],
  'Mercedes-Benz': ['Classe A', 'Classe C', 'Classe E', 'Classe S', 'GLA', 'GLC', 'GLE', 'AMG GT', 'EQS'],
  'Audi': ['A3', 'A4', 'A6', 'Q3', 'Q5', 'Q7', 'TT', 'R8', 'e-tron', 'RS3', 'RS6'],
  'Nissan': ['Kicks', 'Versa', 'Sentra', 'Frontier', 'Leaf', 'GT-R', 'Murano'],
  'Renault': ['Kwid', 'Sandero', 'Logan', 'Duster', 'Captur', 'Megane', 'Oroch'],
  'Peugeot': ['208', '308', '2008', '3008', '5008', '408'],
  'Citroën': ['C3', 'C4', 'Aircross', 'Berlingo', 'SpaceTourer'],
  'Mitsubishi': ['Eclipse Cross', 'Outlander', 'L200 Triton', 'ASX', 'Pajero'],
  'Kia': ['Picanto', 'Rio', 'Cerato', 'Sportage', 'Sorento', 'Stinger', 'EV6'],
  'Porsche': ['911', 'Cayenne', 'Macan', 'Panamera', 'Taycan', 'Boxster', 'Cayman'],
  'Ferrari': ['Roma', 'SF90', 'F8', '296 GTB', '812', 'Portofino'],
  'Lamborghini': ['Huracán', 'Urus', 'Revuelto'],
  'Tesla': ['Model 3', 'Model S', 'Model X', 'Model Y', 'Cybertruck'],
  'Subaru': ['Impreza', 'Outback', 'Forester', 'XV', 'WRX', 'BRZ'],
  'Mazda': ['Mazda3', 'CX-5', 'CX-30', 'MX-5', 'MX-30'],
  'Volvo': ['XC40', 'XC60', 'XC90', 'S60', 'V60', 'C40'],
  'Land Rover': ['Discovery', 'Defender', 'Range Rover', 'Evoque', 'Velar'],
  'Jaguar': ['XE', 'XF', 'XJ', 'F-Type', 'E-Pace', 'F-Pace', 'I-Pace'],
};

function Field({ label, children, required }) {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-700 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass = "w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400 focus:ring-1 focus:ring-red-100 bg-white";
const selectClass = "w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400 bg-white appearance-none";

export default function AdModal({ open, onClose }) {
  const navigate = useNavigate();
  const [plan, setPlan] = useState('dono');

  const [form, setForm] = useState({
    title: '',
    vehicleType: '',
    yearFab: '',
    yearModel: '',
    brand: '',
    model: '',
    price: '',
    email: '',
    cpf: '',
    chassis: '',
    description: '',
    showPhone: false,
    images: [],
  });
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
    const html = buildPreviewHtml(form);
    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const code = 'BT-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    await db.entities.Vehicle.create({
      title: form.title,
      brand: form.brand,
      model: form.model,
      year_fabrication: parseInt(form.yearFab) || undefined,
      year_model: parseInt(form.yearModel) || undefined,
      price: parseFloat(form.price.replace(/\D/g, '')) || 0,
      images: form.images,
      category: 'passeio',
    });
    setSubmitting(false);
    onClose();
    const params = new URLSearchParams({
      codigo: code,
      titulo: form.title,
      marca: form.brand,
      modelo: form.model,
      preco: form.price,
      imagem: form.images[0] || '',
      email: form.email,
    });
    navigate(createPageUrl('AnuncioPublicado') + '?' + params.toString());
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">Criar Anúncio</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Preencha os dados do seu veículo</p>
          </div>
          <div className="flex items-center gap-2 mr-8">
            <select
              value={plan}
              onChange={e => setPlan(e.target.value)}
              className="border border-zinc-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-red-400 bg-white font-semibold text-zinc-700"
            >
              <option value="dono">Sou o Dono (Grátis)</option>
              <option value="vendedor">Vendedor (R$ 59,90)</option>
              <option value="agencia">Agência (R$ 89,90)</option>
              <option value="concessionaria">Concessionária (R$ 349,00)</option>
            </select>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-100">
            <X className="w-4 h-4 text-zinc-600" />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

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
            <p className="text-xs text-zinc-400 mt-1">Seu CPF é usado para limitar a quantidade de anúncios por plano e não será exibido publicamente.</p>
          </Field>

          {(plan === 'vendedor' || plan === 'agencia' || plan === 'concessionaria') && (
            <Field label="Número do chassi (RENAVAM)" required>
              <input
                className={inputClass}
                placeholder="Ex: 9BWZZZ377VT004251"
                maxLength={17}
                value={form.chassis}
                onChange={e => set('chassis', e.target.value.toUpperCase())}
              />
              <p className="text-xs text-zinc-400 mt-1">O chassi é obrigatório para planos profissionais e não será exibido no anúncio.</p>
            </Field>
          )}

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
              {CAR_BRANDS.map(b => (
                <option key={b.name} value={b.name}>{b.name}</option>
              ))}
            </select>
            {form.brand && (
              <div className="flex items-center gap-2 mt-2">
                <img
                  src={CAR_BRANDS.find(b => b.name === form.brand)?.logo}
                  alt={form.brand}
                  className="h-6 w-auto object-contain"
                  onError={e => e.target.style.display='none'}
                />
                <span className="text-sm font-medium text-zinc-700">{form.brand}</span>
              </div>
            )}
          </Field>

          <Field label="Modelo" required>
            <select className={selectClass} value={form.model} onChange={e => set('model', e.target.value)} disabled={!form.brand}>
              <option value="">{form.brand ? 'Selecione o modelo...' : 'Selecione a marca primeiro'}</option>
              {availableModels.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
              {form.brand && availableModels.length === 0 && (
                <option value={form.brand + ' (outro)'}>Outro modelo</option>
              )}
            </select>
          </Field>

          <Field label="E-mail de contato" required>
            <input
              className={inputClass}
              type="email"
              placeholder="seu@email.com"
              value={form.email}
              onChange={e => set('email', e.target.value)}
            />
            <p className="text-xs text-zinc-400 mt-1">Usado para receber o código do anúncio e senhas de edição.</p>
          </Field>

          <Field label="Valor de venda (R$)" required>
            <input className={inputClass} placeholder="Ex: 85.000" value={form.price} onChange={e => set('price', e.target.value)} />
          </Field>

          <Field label="Fotos do veículo">
            <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-zinc-300 rounded-xl cursor-pointer hover:border-red-400 hover:bg-red-50/30 transition-colors">
              <Upload className="w-6 h-6 text-zinc-400 mb-1" />
              <span className="text-sm text-zinc-500">{uploading ? 'Enviando...' : 'Clique para selecionar fotos'}</span>
              <span className="text-xs text-zinc-400 mt-0.5">JPG, PNG — múltiplos arquivos aceitos</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} disabled={uploading} />
            </label>
            {form.images.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {form.images.map((url, i) => (
                  <div key={i} className="relative group">
                    <img src={url} alt="" className="w-16 h-16 object-cover rounded-lg border border-zinc-200" />
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
              className={`${inputClass} h-24 resize-none`}
              placeholder="Descreva o estado do veículo, revisões, extras, histórico..."
              value={form.description}
              onChange={e => set('description', e.target.value)}
            />
          </Field>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <button
              type="button"
              onClick={() => set('showPhone', !form.showPhone)}
              className="flex-shrink-0"
            >
              {form.showPhone
                ? <CheckSquare className="w-5 h-5 text-red-600" />
                : <Square className="w-5 h-5 text-zinc-400" />
              }
            </button>
            <span className="text-sm text-zinc-700">Exibir meu telefone no anúncio</span>
          </label>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-100 space-y-3">
          <div className="flex gap-3">
            <Button variant="outline" onClick={handlePreview} className="flex-1 rounded-xl gap-2">
              <Eye className="w-4 h-4" />
              Visualizar anúncio
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || !form.title || !form.brand || !form.price || !form.email || !form.cpf || ((plan === 'vendedor' || plan === 'agencia' || plan === 'concessionaria') && !form.chassis)}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl gap-2"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Publicando...' : 'Publicar anúncio'}
            </Button>
          </div>
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>🎉 Plano <strong className="text-zinc-600">{plan === 'dono' ? 'Sou o Dono' : plan === 'vendedor' ? 'Vendedor' : plan === 'agencia' ? 'Agência' : 'Concessionária'}</strong> selecionado</span>
            <a href={`/${createPageUrl('Planos')}`} target="_blank" rel="noreferrer" className="text-red-500 hover:underline flex items-center gap-1">
              <Zap className="w-3 h-3" /> Ver planos
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function buildPreviewHtml(form) {
  const brand = form.brand || '—';
  const model = form.model || '—';
  const year = form.yearModel || form.yearFab || '—';
  const price = form.price ? `R$ ${form.price}` : '—';
  const images = form.images.length > 0
    ? form.images.map(url => `<img src="${url}" style="width:100%;max-height:340px;object-fit:cover;border-radius:12px;margin-bottom:12px;" />`).join('')
    : `<div style="width:100%;height:240px;background:#f4f4f5;border-radius:12px;display:flex;align-items:center;justify-content:center;color:#a1a1aa;font-size:14px;margin-bottom:12px;">Sem fotos</div>`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${form.title || 'Anúncio'} – BuscaTurbo</title>
<style>
  body { font-family: system-ui, sans-serif; margin: 0; background: #f9f9f9; color: #18181b; }
  .container { max-width: 720px; margin: 0 auto; padding: 24px 16px; }
  .header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
  .header img { height: 40px; }
  h1 { font-size: 22px; font-weight: 800; margin: 0 0 8px; }
  .meta { display: flex; gap: 16px; font-size: 14px; color: #71717a; margin-bottom: 20px; }
  .price { font-size: 28px; font-weight: 900; color: #dc2626; margin: 12px 0 20px; }
  .desc { font-size: 15px; line-height: 1.6; color: #3f3f46; background: white; padding: 16px; border-radius: 12px; }
  .badge { display: inline-block; background: #fef2f2; color: #dc2626; padding: 4px 12px; border-radius: 99px; font-size: 12px; font-weight: 700; margin-bottom: 16px; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a1012fd10d7df3befc3b79/50ef0cf69_logobt.png" alt="BuscaTurbo" />
  </div>
  <span class="badge">Pré-visualização do anúncio</span>
  ${images}
  <h1>${form.title || 'Título não informado'}</h1>
  <div class="meta">
    <span>${brand} ${model}</span>
    <span>${year}</span>
    ${form.vehicleType ? `<span>${form.vehicleType.charAt(0).toUpperCase() + form.vehicleType.slice(1)}</span>` : ''}
  </div>
  <div class="price">${price}</div>
  ${form.description ? `<div class="desc"><strong>Descrição:</strong><br/>${form.description.replace(/\n/g,'<br/>')}</div>` : ''}
</div>
</body>
</html>`;
}