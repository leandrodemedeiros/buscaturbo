import { supabase } from '@/lib/supabase';
import { useAdmin } from '@/lib/useAdmin';
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Car, Zap, Shield, LogOut,
  CheckCircle, Clock, RefreshCw, Calendar,
  Loader2, Search, Ban, EyeOff, Plus,
  ArrowUpRight, Star, Trash2, X
} from 'lucide-react';
import { cn } from '@/lib/utils';

const fmt = (n) => (n || 0).toLocaleString('pt-BR');
const fmtMoney = (n) => (n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('pt-BR') : '—';

const PERIOD_OPTIONS = [
  { label: 'Mês atual', value: 'month' },
  { label: 'Trimestre', value: 'quarter' },
  { label: 'Semestre', value: 'semester' },
];

function getPeriodStart(period) {
  const now = new Date();
  if (period === 'month') return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  if (period === 'quarter') return new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString();
  return new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString();
}

const Card = ({ children, className }) => (
  <div className={cn("bg-white rounded-2xl border border-zinc-200", className)}>{children}</div>
);

const StatCard = ({ icon: Icon, label, value, sub, color = 'zinc' }) => {
  const colors = {
    zinc: 'bg-zinc-100 text-zinc-600', green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600', amber: 'bg-amber-100 text-amber-600',
    blue: 'bg-blue-100 text-blue-600',
  };
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-zinc-500 font-medium">{label}</p>
          <p className="text-2xl font-black text-zinc-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-zinc-400 mt-0.5">{sub}</p>}
        </div>
        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", colors[color])}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
    </Card>
  );
};

const Badge = ({ status }) => {
  const map = {
    active:   { label: 'Ativo',      cls: 'bg-green-100 text-green-700' },
    inactive: { label: 'Inativo',    cls: 'bg-zinc-100 text-zinc-600' },
    blocked:  { label: 'Bloqueado',  cls: 'bg-red-100 text-red-700' },
    sold:     { label: 'Vendido',    cls: 'bg-blue-100 text-blue-700' },
    approved: { label: 'Aprovado',   cls: 'bg-green-100 text-green-700' },
    pending:  { label: 'Pendente',   cls: 'bg-amber-100 text-amber-700' },
    expired:  { label: 'Expirado',   cls: 'bg-zinc-100 text-zinc-500' },
    extended: { label: 'Prorrogado', cls: 'bg-purple-100 text-purple-700' },
  };
  const { label, cls } = map[status] || { label: status, cls: 'bg-zinc-100 text-zinc-600' };
  return <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", cls)}>{label}</span>;
};

// ── Dashboard ──────────────────────────────────────────────────────
function Dashboard({ period }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const since = getPeriodStart(period);
    try {
      const [vehicles, payments, userStatus, accesses] = await Promise.all([
        supabase.from('vehicles').select('status, is_featured, created_date'),
        supabase.from('highlight_payments').select('amount, status, created_at').gte('created_at', since),
        supabase.from('user_status').select('status, user_type'),
        supabase.from('access_logs').select('id', { count: 'exact', head: true }).gte('created_at', since),
      ]);

      const vData = vehicles.data || [];
      const pData = payments.data || [];
      const uData = userStatus.data || [];

      setStats({
        vehicles: {
          total: vData.length,
          active: vData.filter(v => !v.status || v.status === 'active').length,
          inactive: vData.filter(v => v.status === 'inactive').length,
          blocked: vData.filter(v => v.status === 'blocked').length,
          sold: vData.filter(v => v.status === 'sold').length,
          featured: vData.filter(v => v.is_featured).length,
          new: vData.filter(v => v.created_date >= since).length,
        },
        payments: {
          total: pData.length,
          revenue: pData.filter(p => p.status === 'approved').reduce((s, p) => s + (p.amount || 0), 0),
          approved: pData.filter(p => p.status === 'approved').length,
          pending: pData.filter(p => p.status === 'pending').length,
        },
        users: {
          total: uData.length,
          active: uData.filter(u => u.status === 'active').length,
          blocked: uData.filter(u => u.status === 'blocked').length,
          owners: uData.filter(u => u.user_type === 'owner').length,
          professionals: uData.filter(u => u.user_type === 'professional').length,
          agencies: uData.filter(u => u.user_type === 'agency').length,
        },
        accesses: accesses.count || 0,
      });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [period]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-zinc-400" /></div>;
  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Car} label="Anúncios ativos" value={fmt(stats.vehicles.active)} sub={`${fmt(stats.vehicles.new)} novos no período`} color="green" />
        <StatCard icon={Users} label="Usuários gerenciados" value={fmt(stats.users.total)} sub={`${fmt(stats.users.blocked)} bloqueados`} color="blue" />
        <StatCard icon={Zap} label="Receita no período" value={fmtMoney(stats.payments.revenue)} sub={`${fmt(stats.payments.approved)} destaques pagos`} color="amber" />
        <StatCard icon={LayoutDashboard} label="Acessos no período" value={fmt(stats.accesses)} color="zinc" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="font-bold text-zinc-900 mb-4 flex items-center gap-2"><Car className="w-4 h-4 text-red-600" /> Anúncios por status</h3>
          <div className="space-y-3">
            {[
              { label: 'Ativos', value: stats.vehicles.active, color: 'bg-green-500' },
              { label: 'Inativos', value: stats.vehicles.inactive, color: 'bg-zinc-300' },
              { label: 'Bloqueados', value: stats.vehicles.blocked, color: 'bg-red-500' },
              { label: 'Vendidos', value: stats.vehicles.sold, color: 'bg-blue-500' },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <div className="flex justify-between text-xs text-zinc-600 mb-1">
                  <span>{label}</span><span className="font-semibold">{fmt(value)}</span>
                </div>
                <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full", color)} style={{ width: stats.vehicles.total ? `${(value / stats.vehicles.total) * 100}%` : '0%' }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="font-bold text-zinc-900 mb-4 flex items-center gap-2"><Zap className="w-4 h-4 text-amber-500" /> Destaques no período</h3>
          <div className="space-y-2">
            {[
              { label: 'Destaques ativos', value: fmt(stats.vehicles.featured), cls: 'text-zinc-900' },
              { label: 'Pagamentos aprovados', value: fmt(stats.payments.approved), cls: 'text-green-700' },
              { label: 'Pagamentos pendentes', value: fmt(stats.payments.pending), cls: 'text-amber-700' },
              { label: 'Receita total', value: fmtMoney(stats.payments.revenue), cls: 'text-zinc-900 font-black' },
            ].map(({ label, value, cls }) => (
              <div key={label} className="flex justify-between items-center py-2 border-b border-zinc-100 last:border-0">
                <span className="text-sm text-zinc-600">{label}</span>
                <span className={cn("font-bold text-sm", cls)}>{value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── Usuários ───────────────────────────────────────────────────────
function UsersPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(null);

  const load = async () => {
    setLoading(true);
    // Busca veículos para obter e-mails únicos de anunciantes
    const { data: vehicles } = await supabase
      .from('vehicles')
      .select('created_by')
      .not('created_by', 'is', null);

    // Busca status gerenciados
    const { data: statusData } = await supabase
      .from('user_status')
      .select('*')
      .order('updated_at', { ascending: false });

    const statusMap = {};
    (statusData || []).forEach(s => { statusMap[s.email] = s; });

    // Mescla: todos os anunciantes + os que têm status gerenciado
    const emailsFromVehicles = [...new Set((vehicles || []).map(v => v.created_by).filter(Boolean))];
    const emailsFromStatus = (statusData || []).map(s => s.email);
    const allEmails = [...new Set([...emailsFromVehicles, ...emailsFromStatus])];

    const merged = allEmails.map(email => ({
      email,
      status: statusMap[email]?.status || 'active',
      user_type: statusMap[email]?.user_type || 'owner',
      cpf: statusMap[email]?.cpf || null,
      blocked_at: statusMap[email]?.blocked_at || null,
    }));

    setUsers(merged);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (email, status) => {
    setSaving(email);
    const now = new Date().toISOString();
    const { data: { user } } = await supabase.auth.getUser();
    const updates = { email, status, updated_at: now };
    if (status === 'blocked') { updates.blocked_at = now; updates.blocked_by = user?.email; }
    if (status === 'active') { updates.blocked_at = null; updates.blocked_by = null; }

    await supabase.from('user_status').upsert(updates, { onConflict: 'email' });

    if (status === 'blocked') {
      await supabase.from('vehicles').update({ status: 'blocked', blocked_at: now, blocked_by: user?.email })
        .eq('created_by', email).neq('status', 'sold');
    }
    if (status === 'active') {
      await supabase.from('vehicles').update({ status: 'active', blocked_at: null, blocked_by: null })
        .eq('created_by', email).eq('status', 'blocked');
    }
    await load();
    setSaving(null);
  };

  const updateType = async (email, user_type) => {
    await supabase.from('user_status').upsert({ email, user_type, updated_at: new Date().toISOString() }, { onConflict: 'email' });
    setUsers(u => u.map(x => x.email === email ? { ...x, user_type } : x));
  };

  const filtered = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.cpf?.includes(search)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input className="w-full pl-9 pr-4 py-2 text-sm border border-zinc-200 rounded-xl outline-none focus:border-red-400" placeholder="Buscar por e-mail ou CPF..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button onClick={load} className="p-2 border border-zinc-200 rounded-xl hover:bg-zinc-50"><RefreshCw className="w-4 h-4 text-zinc-500" /></button>
      </div>
      {loading ? <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-zinc-400" /></div> : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100">
                  {['E-mail', 'CPF', 'Tipo', 'Status', 'Bloqueado em', 'Ações'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && <tr><td colSpan={6} className="text-center py-10 text-zinc-400 text-sm">Nenhum usuário encontrado</td></tr>}
                {filtered.map(u => (
                  <tr key={u.email} className="border-b border-zinc-50 hover:bg-zinc-50">
                    <td className="px-4 py-3 font-medium text-zinc-800">{u.email}</td>
                    <td className="px-4 py-3 text-zinc-500 text-xs">{u.cpf || '—'}</td>
                    <td className="px-4 py-3">
                      <select value={u.user_type} onChange={e => updateType(u.email, e.target.value)} className="text-xs border border-zinc-200 rounded-lg px-2 py-1 outline-none focus:border-red-400 bg-white">
                        <option value="owner">Proprietário</option>
                        <option value="professional">Profissional</option>
                        <option value="agency">Agência</option>
                      </select>
                    </td>
                    <td className="px-4 py-3"><Badge status={u.status} /></td>
                    <td className="px-4 py-3 text-xs text-zinc-400">{fmtDate(u.blocked_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {saving === u.email ? <Loader2 className="w-4 h-4 animate-spin text-zinc-400" /> : (
                          <>
                            {u.status !== 'active' && <button onClick={() => updateStatus(u.email, 'active')} title="Ativar" className="p-1.5 hover:bg-green-50 rounded-lg text-green-600"><CheckCircle className="w-4 h-4" /></button>}
                            {u.status !== 'inactive' && <button onClick={() => updateStatus(u.email, 'inactive')} title="Inativar" className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-500"><EyeOff className="w-4 h-4" /></button>}
                            {u.status !== 'blocked' && <button onClick={() => { if (confirm(`Bloquear ${u.email} e todos seus anúncios?`)) updateStatus(u.email, 'blocked'); }} title="Bloquear" className="p-1.5 hover:bg-red-50 rounded-lg text-red-600"><Ban className="w-4 h-4" /></button>}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

// ── Anúncios ───────────────────────────────────────────────────────
function VehiclesPanel() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('vehicles')
      .select('id, title, brand, model, price, status, is_featured, created_by, created_date, blocked_at')
      .order('created_date', { ascending: false }).limit(200);
    setVehicles(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    setSaving(id);
    const { data: { user } } = await supabase.auth.getUser();
    const updates = { status };
    if (status === 'blocked') { updates.blocked_at = new Date().toISOString(); updates.blocked_by = user?.email; }
    if (status === 'active') { updates.blocked_at = null; updates.blocked_by = null; }
    await supabase.from('vehicles').update(updates).eq('id', id);
    await load();
    setSaving(null);
  };

  const filtered = vehicles.filter(v =>
    v.title?.toLowerCase().includes(search.toLowerCase()) ||
    v.brand?.toLowerCase().includes(search.toLowerCase()) ||
    v.created_by?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input className="w-full pl-9 pr-4 py-2 text-sm border border-zinc-200 rounded-xl outline-none focus:border-red-400" placeholder="Título, marca ou anunciante..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button onClick={load} className="p-2 border border-zinc-200 rounded-xl hover:bg-zinc-50"><RefreshCw className="w-4 h-4 text-zinc-500" /></button>
      </div>
      {loading ? <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-zinc-400" /></div> : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100">
                  {['Anúncio', 'Anunciante', 'Preço', 'Status', 'Destaque', 'Ações'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && <tr><td colSpan={6} className="text-center py-10 text-zinc-400 text-sm">Nenhum anúncio encontrado</td></tr>}
                {filtered.map(v => (
                  <tr key={v.id} className="border-b border-zinc-50 hover:bg-zinc-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-zinc-900 truncate max-w-[180px]">{v.title}</p>
                      <p className="text-xs text-zinc-400">{v.brand} · {fmtDate(v.created_date)}</p>
                    </td>
                    <td className="px-4 py-3 text-zinc-500 text-xs truncate max-w-[140px]">{v.created_by}</td>
                    <td className="px-4 py-3 font-semibold text-zinc-900">{fmtMoney(v.price)}</td>
                    <td className="px-4 py-3"><Badge status={v.status || 'active'} /></td>
                    <td className="px-4 py-3">
                      {v.is_featured
                        ? <span className="text-xs font-semibold text-amber-600 flex items-center gap-1"><Star className="w-3 h-3" /> Ativo</span>
                        : <span className="text-xs text-zinc-400">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {saving === v.id ? <Loader2 className="w-4 h-4 animate-spin text-zinc-400" /> : (
                          <>
                            {v.status !== 'active' && <button onClick={() => updateStatus(v.id, 'active')} title="Ativar" className="p-1.5 hover:bg-green-50 rounded-lg text-green-600"><CheckCircle className="w-4 h-4" /></button>}
                            {v.status !== 'inactive' && v.status !== 'sold' && <button onClick={() => updateStatus(v.id, 'inactive')} title="Inativar" className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-500"><EyeOff className="w-4 h-4" /></button>}
                            {v.status !== 'blocked' && <button onClick={() => { if (confirm('Bloquear este anúncio?')) updateStatus(v.id, 'blocked'); }} title="Bloquear" className="p-1.5 hover:bg-red-50 rounded-lg text-red-600"><Ban className="w-4 h-4" /></button>}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

// ── Destaques ──────────────────────────────────────────────────────
function HighlightsPanel() {
  const [highlights, setHighlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [extendModal, setExtendModal] = useState(null);
  const [extendDate, setExtendDate] = useState('');

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('highlight_payments')
      .select('*, vehicles(title, brand, is_featured, featured_until)')
      .order('created_at', { ascending: false }).limit(200);
    setHighlights(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const getStatus = (h) => {
    if (h.status !== 'approved') return h.status;
    if (h.extended_until) return 'extended';
    if (!h.vehicles?.is_featured) return 'inactive';
    if (new Date(h.expires_at) < new Date()) return 'expired';
    return 'active';
  };

  const toggleFeatured = async (h, enable) => {
    setSaving(h.id);
    await supabase.from('vehicles').update({ is_featured: enable }).eq('id', h.vehicle_id);
    await load(); setSaving(null);
  };

  const renew = async (h) => {
    setSaving(h.id);
    const exp = new Date(); exp.setDate(exp.getDate() + 7);
    await supabase.from('vehicles').update({ is_featured: true, featured_until: exp.toISOString() }).eq('id', h.vehicle_id);
    await supabase.from('highlight_payments').update({ expires_at: exp.toISOString(), status: 'approved' }).eq('id', h.id);
    await load(); setSaving(null);
  };

  const extend = async () => {
    if (!extendDate || !extendModal) return;
    setSaving(extendModal.id);
    const exp = new Date(extendDate + 'T23:59:59');
    await supabase.from('vehicles').update({ is_featured: true, featured_until: exp.toISOString() }).eq('id', extendModal.vehicle_id);
    await supabase.from('highlight_payments').update({ expires_at: exp.toISOString(), extended_until: exp.toISOString(), status: 'approved' }).eq('id', extendModal.id);
    setExtendModal(null); setExtendDate('');
    await load(); setSaving(null);
  };

  const planLabels = { busca: 'Busca', home_busca_7: 'Home+Busca', home_busca_15: 'Premium' };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={load} className="p-2 border border-zinc-200 rounded-xl hover:bg-zinc-50"><RefreshCw className="w-4 h-4 text-zinc-500" /></button>
      </div>
      {loading ? <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-zinc-400" /></div> : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100">
                  {['Anúncio', 'Plano', 'Valor', 'Expira em', 'Status', 'Ações'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {highlights.length === 0 && <tr><td colSpan={6} className="text-center py-10 text-zinc-400 text-sm">Nenhum destaque encontrado</td></tr>}
                {highlights.map(h => {
                  const status = getStatus(h);
                  return (
                    <tr key={h.id} className="border-b border-zinc-50 hover:bg-zinc-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-zinc-900 truncate max-w-[160px]">{h.vehicles?.title || '—'}</p>
                      </td>
                      <td className="px-4 py-3 text-zinc-600 text-xs">{planLabels[h.plan_id] || h.plan_id}</td>
                      <td className="px-4 py-3 font-semibold">{fmtMoney(h.amount)}</td>
                      <td className="px-4 py-3 text-zinc-500 text-xs">{fmtDate(h.expires_at)}</td>
                      <td className="px-4 py-3"><Badge status={status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {saving === h.id ? <Loader2 className="w-4 h-4 animate-spin text-zinc-400" /> : (
                            <>
                              {status !== 'active' && <button onClick={() => toggleFeatured(h, true)} title="Ativar" className="p-1.5 hover:bg-green-50 rounded-lg text-green-600"><CheckCircle className="w-4 h-4" /></button>}
                              {status === 'active' && <button onClick={() => toggleFeatured(h, false)} title="Inativar" className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-500"><EyeOff className="w-4 h-4" /></button>}
                              <button onClick={() => renew(h)} title="Renovar +7 dias" className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600"><RefreshCw className="w-4 h-4" /></button>
                              <button onClick={() => { setExtendModal(h); setExtendDate(''); }} title="Prorrogar até data" className="p-1.5 hover:bg-purple-50 rounded-lg text-purple-600"><Calendar className="w-4 h-4" /></button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      {extendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setExtendModal(null)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-zinc-900">Prorrogar destaque</h3>
              <button onClick={() => setExtendModal(null)}><X className="w-4 h-4 text-zinc-400" /></button>
            </div>
            <p className="text-sm text-zinc-500 truncate">{extendModal.vehicles?.title}</p>
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">Nova data de expiração</label>
              <input type="date" className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-red-400" value={extendDate} onChange={e => setExtendDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setExtendModal(null)} className="flex-1 border border-zinc-200 rounded-xl py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50">Cancelar</button>
              <button onClick={extend} disabled={!extendDate} className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl py-2 text-sm font-semibold">Prorrogar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Administradores ────────────────────────────────────────────────
function AdminsPanel({ isSuperAdmin }) {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [adding, setAdding] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('admins').select('*').order('created_at');
    setAdmins(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const addAdmin = async () => {
    if (!newEmail) return;
    setAdding(true);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('admins').insert({ email: newEmail, is_super: false, created_by: user?.email });
    setNewEmail(''); await load(); setAdding(false);
  };

  const removeAdmin = async (email) => {
    if (!confirm(`Remover ${email} como administrador?`)) return;
    await supabase.from('admins').delete().eq('email', email).eq('is_super', false);
    await load();
  };

  return (
    <div className="space-y-4 max-w-lg">
      {isSuperAdmin && (
        <Card className="p-4">
          <h3 className="font-semibold text-zinc-900 mb-3 text-sm">Adicionar administrador</h3>
          <div className="flex gap-2">
            <input type="email" placeholder="E-mail do novo admin" className="flex-1 border border-zinc-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-red-400" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
            <button onClick={addAdmin} disabled={adding || !newEmail} className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl px-4 text-sm font-semibold flex items-center gap-1">
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Adicionar
            </button>
          </div>
        </Card>
      )}
      <Card>
        {loading ? <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-zinc-400" /></div> : (
          <div className="divide-y divide-zinc-100">
            {admins.map(a => (
              <div key={a.email} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-zinc-900">{a.email}</p>
                  <p className="text-xs text-zinc-400">{a.is_super ? 'Super Admin' : 'Admin'} · desde {fmtDate(a.created_at)}</p>
                </div>
                <div className="flex items-center gap-2">
                  {a.is_super && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">Super</span>}
                  {isSuperAdmin && !a.is_super && (
                    <button onClick={() => removeAdmin(a.email)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500"><Trash2 className="w-4 h-4" /></button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ── Página principal ───────────────────────────────────────────────
const SECTIONS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'Usuários', icon: Users },
  { id: 'vehicles', label: 'Anúncios', icon: Car },
  { id: 'highlights', label: 'Destaques', icon: Zap },
  { id: 'admins', label: 'Administradores', icon: Shield },
];

export default function Admin() {
  const navigate = useNavigate();
  const { isAdmin, isSuperAdmin, loading: adminLoading } = useAdmin();
  const [section, setSection] = useState('dashboard');
  const [period, setPeriod] = useState('month');

  useEffect(() => { if (!adminLoading && !isAdmin) navigate('/'); }, [isAdmin, adminLoading]);

  if (adminLoading) return <div className="fixed inset-0 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-red-600" /></div>;
  if (!isAdmin) return null;

  const current = SECTIONS.find(s => s.id === section);

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      <div className="w-56 bg-white border-r border-zinc-200 flex flex-col fixed inset-y-0 left-0 z-20">
        <div className="px-5 py-5 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-zinc-900 text-sm">Admin</span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">BuscaTurbo</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {SECTIONS.map(s => {
            const Icon = s.icon;
            return (
              <button key={s.id} onClick={() => setSection(s.id)} className={cn("w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors", section === s.id ? "bg-red-50 text-red-700" : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900")}>
                <Icon className="w-4 h-4 flex-shrink-0" /> {s.label}
              </button>
            );
          })}
        </nav>
        <div className="px-3 py-4 border-t border-zinc-100 space-y-1">
          <button onClick={() => navigate('/')} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800 transition-colors">
            <ArrowUpRight className="w-4 h-4" /> Ver site
          </button>
          <button onClick={() => supabase.auth.signOut().then(() => navigate('/'))} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      </div>
      <div className="ml-56 flex-1">
        <div className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <h1 className="font-bold text-zinc-900">{current?.label}</h1>
          {section === 'dashboard' && (
            <div className="flex items-center gap-1 bg-zinc-100 rounded-xl p-1">
              {PERIOD_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setPeriod(opt.value)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-colors", period === opt.value ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700")}>
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="p-6">
          {section === 'dashboard' && <Dashboard period={period} />}
          {section === 'users' && <UsersPanel />}
          {section === 'vehicles' && <VehiclesPanel />}
          {section === 'highlights' && <HighlightsPanel />}
          {section === 'admins' && <AdminsPanel isSuperAdmin={isSuperAdmin} />}
        </div>
      </div>
    </div>
  );
}
