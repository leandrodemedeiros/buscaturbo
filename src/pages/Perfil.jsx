import { db } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, FileText, Shield, Save, ArrowLeft,
  Loader2, CheckCircle, AlertCircle, Eye, EyeOff, Smartphone, X, Lock
} from 'lucide-react';

const inputClass = "w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-1 focus:ring-red-100 bg-white";
const labelClass = "block text-xs font-medium text-zinc-600 mb-1";

// ─── Seção: card de seção ─────────────────────────────────────────
const Section = ({ title, description, icon: Icon, children }) => (
  <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
    <div className="px-6 py-4 border-b border-zinc-100 flex items-center gap-3">
      <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
        <Icon className="w-4 h-4 text-red-600" />
      </div>
      <div>
        <h2 className="font-semibold text-zinc-900 text-sm">{title}</h2>
        {description && <p className="text-xs text-zinc-500">{description}</p>}
      </div>
    </div>
    <div className="px-6 py-5">{children}</div>
  </div>
);

// ─── Toast inline ─────────────────────────────────────────────────
const Toast = ({ type, message, onClose }) => {
  if (!message) return null;
  const isSuccess = type === 'success';
  return (
    <div className={`flex items-start gap-3 rounded-xl px-4 py-3 text-sm ${isSuccess ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
      {isSuccess ? <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X className="w-3.5 h-3.5 opacity-60 hover:opacity-100" /></button>
    </div>
  );
};

export default function Perfil() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dados do perfil
  const [profile, setProfile] = useState({ full_name: '', phone: '', document_type: 'cpf', document_number: '' });
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  // Senha
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
  const [savingPassword, setSavingPassword] = useState(false);

  // 2FA
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [twoFAStep, setTwoFAStep] = useState('idle'); // idle | setup | verify | disable
  const [qrCode, setQrCode] = useState('');
  const [totpSecret, setTotpSecret] = useState('');
  const [factorId, setFactorId] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [twoFAMsg, setTwoFAMsg] = useState({ type: '', text: '' });
  const [loading2FA, setLoading2FA] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/'); return; }
      setUser(user);
      setProfile({
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
        phone: user.user_metadata?.phone || '',
        document_type: user.user_metadata?.document_type || 'cpf',
        document_number: user.user_metadata?.document_number || '',
      });
      // Verificar se 2FA está ativo
      const { data } = await supabase.auth.mfa.listFactors();
      const verified = data?.totp?.find(f => f.status === 'verified');
      if (verified) { setTwoFAEnabled(true); setFactorId(verified.id); }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // ── Salvar perfil ──
  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg({ type: '', text: '' });
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: profile.full_name,
          phone: profile.phone,
          document_type: profile.document_type,
          document_number: profile.document_number,
        }
      });
      if (error) throw error;
      setProfileMsg({ type: 'success', text: 'Perfil atualizado com sucesso!' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message });
    } finally {
      setSavingProfile(false);
    }
  };

  // ── Alterar senha ──
  const savePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });
    if (passwords.new !== passwords.confirm) {
      setPasswordMsg({ type: 'error', text: 'As senhas não coincidem.' }); return;
    }
    if (passwords.new.length < 6) {
      setPasswordMsg({ type: 'error', text: 'A nova senha deve ter pelo menos 6 caracteres.' }); return;
    }
    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: passwords.new });
      if (error) throw error;
      setPasswordMsg({ type: 'success', text: 'Senha alterada com sucesso!' });
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.message });
    } finally {
      setSavingPassword(false);
    }
  };

  // ── Ativar 2FA: gerar QR ──
  const start2FA = async () => {
    setLoading2FA(true);
    setTwoFAMsg({ type: '', text: '' });
    try {
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'BuscaTurbo' });
      if (error) throw error;
      setQrCode(data.totp.qr_code);
      setTotpSecret(data.totp.secret);
      setFactorId(data.id);
      setTwoFAStep('setup');
    } catch (err) {
      setTwoFAMsg({ type: 'error', text: err.message });
    } finally {
      setLoading2FA(false);
    }
  };

  // ── Verificar código e ativar 2FA ──
  const verify2FA = async (e) => {
    e.preventDefault();
    setLoading2FA(true);
    setTwoFAMsg({ type: '', text: '' });
    try {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
      if (challengeError) throw challengeError;
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code: otpCode,
      });
      if (verifyError) throw verifyError;
      setTwoFAEnabled(true);
      setTwoFAStep('idle');
      setOtpCode('');
      setTwoFAMsg({ type: 'success', text: 'Autenticação em dois fatores ativada!' });
    } catch (err) {
      setTwoFAMsg({ type: 'error', text: 'Código inválido. Tente novamente.' });
    } finally {
      setLoading2FA(false);
    }
  };

  // ── Desativar 2FA ──
  const disable2FA = async (e) => {
    e.preventDefault();
    setLoading2FA(true);
    setTwoFAMsg({ type: '', text: '' });
    try {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
      if (challengeError) throw challengeError;
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code: otpCode,
      });
      if (verifyError) throw verifyError;
      const { error: unenrollError } = await supabase.auth.mfa.unenroll({ factorId });
      if (unenrollError) throw unenrollError;
      setTwoFAEnabled(false);
      setTwoFAStep('idle');
      setOtpCode('');
      setFactorId('');
      setTwoFAMsg({ type: 'success', text: 'Autenticação em dois fatores desativada.' });
    } catch (err) {
      setTwoFAMsg({ type: 'error', text: 'Código inválido. Tente novamente.' });
    } finally {
      setLoading2FA(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-zinc-200 border-t-red-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Voltar */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-800 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>

        {/* Cabeçalho */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center text-2xl font-bold text-red-600">
            {profile.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900">{profile.full_name || 'Meu Perfil'}</h1>
            <p className="text-sm text-zinc-500">{user?.email}</p>
          </div>
        </div>

        {/* ── Dados pessoais ── */}
        <Section title="Dados pessoais" description="Nome, telefone e documento" icon={User}>
          <form onSubmit={saveProfile} className="space-y-4">
            <Toast type={profileMsg.type} message={profileMsg.text} onClose={() => setProfileMsg({ type: '', text: '' })} />
            <div>
              <label className={labelClass}>Nome completo</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input type="text" className={inputClass + " pl-9"} placeholder="Seu nome"
                  value={profile.full_name}
                  onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className={labelClass}>E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input type="email" className={inputClass + " pl-9 bg-zinc-50 text-zinc-400 cursor-not-allowed"} value={user?.email || ''} disabled />
              </div>
              <p className="text-xs text-zinc-400 mt-1">O e-mail não pode ser alterado por aqui.</p>
            </div>
            <div>
              <label className={labelClass}>Telefone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input type="tel" className={inputClass + " pl-9"} placeholder="(11) 99999-9999"
                  value={profile.phone}
                  onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>Tipo de documento</label>
                <select className={inputClass}
                  value={profile.document_type}
                  onChange={e => setProfile(p => ({ ...p, document_type: e.target.value }))}>
                  <option value="cpf">CPF</option>
                  <option value="cnpj">CNPJ</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className={labelClass}>{profile.document_type === 'cpf' ? 'CPF' : 'CNPJ'}</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input type="text" className={inputClass + " pl-9"}
                    placeholder={profile.document_type === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
                    value={profile.document_number}
                    onChange={e => setProfile(p => ({ ...p, document_number: e.target.value }))} />
                </div>
              </div>
            </div>
            <button type="submit" disabled={savingProfile}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-xl h-11 flex items-center justify-center gap-2 font-semibold text-sm transition-colors">
              {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar alterações
            </button>
          </form>
        </Section>

        {/* ── Alterar senha ── */}
        <Section title="Alterar senha" description="Defina uma nova senha para sua conta" icon={Lock}>
          <form onSubmit={savePassword} className="space-y-4">
            <Toast type={passwordMsg.type} message={passwordMsg.text} onClose={() => setPasswordMsg({ type: '', text: '' })} />
            {[
              { key: 'new', label: 'Nova senha', placeholder: 'Mínimo 6 caracteres' },
              { key: 'confirm', label: 'Confirmar nova senha', placeholder: 'Repita a nova senha' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className={labelClass}>{label}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input type={showPw[key] ? 'text' : 'password'} className={inputClass + " pl-9 pr-9"}
                    placeholder={placeholder} minLength={6}
                    value={passwords[key]}
                    onChange={e => setPasswords(p => ({ ...p, [key]: e.target.value }))} />
                  <button type="button" onClick={() => setShowPw(s => ({ ...s, [key]: !s[key] }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                    {showPw[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
            <button type="submit" disabled={savingPassword || !passwords.new || !passwords.confirm}
              className="w-full bg-zinc-800 hover:bg-zinc-900 disabled:opacity-50 text-white rounded-xl h-11 flex items-center justify-center gap-2 font-semibold text-sm transition-colors">
              {savingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              Alterar senha
            </button>
          </form>
        </Section>

        {/* ── 2FA ── */}
        <Section title="Autenticação em dois fatores" description="Proteja sua conta com um app autenticador" icon={Shield}>
          <div className="space-y-4">
            <Toast type={twoFAMsg.type} message={twoFAMsg.text} onClose={() => setTwoFAMsg({ type: '', text: '' })} />

            {/* Status */}
            <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl">
              <div className="flex items-center gap-3">
                <Smartphone className="w-4 h-4 text-zinc-500" />
                <div>
                  <p className="text-sm font-medium text-zinc-800">App autenticador</p>
                  <p className="text-xs text-zinc-500">{twoFAEnabled ? 'Ativado — sua conta está mais protegida' : 'Desativado'}</p>
                </div>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${twoFAEnabled ? 'bg-green-100 text-green-700' : 'bg-zinc-200 text-zinc-500'}`}>
                {twoFAEnabled ? 'Ativo' : 'Inativo'}
              </span>
            </div>

            {/* Idle: botões */}
            {twoFAStep === 'idle' && (
              twoFAEnabled ? (
                <button onClick={() => setTwoFAStep('disable')}
                  className="w-full border border-red-200 text-red-600 hover:bg-red-50 rounded-xl h-10 text-sm font-medium transition-colors">
                  Desativar 2FA
                </button>
              ) : (
                <button onClick={start2FA} disabled={loading2FA}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-xl h-10 flex items-center justify-center gap-2 text-sm font-semibold transition-colors">
                  {loading2FA ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                  Ativar 2FA
                </button>
              )
            )}

            {/* Setup: mostrar QR */}
            {twoFAStep === 'setup' && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800 space-y-1">
                  <p className="font-medium">Como configurar:</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>Baixe um app autenticador (Google Authenticator, Authy etc.)</li>
                    <li>Escaneie o QR code abaixo com o app</li>
                    <li>Digite o código de 6 dígitos gerado pelo app</li>
                  </ol>
                </div>
                {qrCode && (
                  <div className="flex flex-col items-center gap-3">
                    <img src={qrCode} alt="QR Code 2FA" className="w-40 h-40 rounded-xl border border-zinc-200" />
                    <div className="text-center">
                      <p className="text-xs text-zinc-500 mb-1">Ou insira manualmente no app:</p>
                      <code className="text-xs bg-zinc-100 px-3 py-1.5 rounded-lg font-mono break-all">{totpSecret}</code>
                    </div>
                  </div>
                )}
                <form onSubmit={verify2FA} className="space-y-3">
                  <div>
                    <label className={labelClass}>Código de verificação</label>
                    <input type="text" inputMode="numeric" maxLength={6} pattern="[0-9]{6}"
                      className={inputClass + " text-center text-lg tracking-widest font-mono"}
                      placeholder="000000" value={otpCode}
                      onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))} />
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => { setTwoFAStep('idle'); setOtpCode(''); }}
                      className="flex-1 border border-zinc-200 text-zinc-600 rounded-xl h-10 text-sm font-medium hover:bg-zinc-50 transition-colors">
                      Cancelar
                    </button>
                    <button type="submit" disabled={loading2FA || otpCode.length < 6}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-xl h-10 flex items-center justify-center gap-2 text-sm font-semibold transition-colors">
                      {loading2FA ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verificar e ativar'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Disable: confirmar com código */}
            {twoFAStep === 'disable' && (
              <form onSubmit={disable2FA} className="space-y-3">
                <p className="text-sm text-zinc-600">Para desativar o 2FA, confirme com o código do seu app autenticador:</p>
                <input type="text" inputMode="numeric" maxLength={6} pattern="[0-9]{6}"
                  className={inputClass + " text-center text-lg tracking-widest font-mono"}
                  placeholder="000000" value={otpCode}
                  onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))} />
                <div className="flex gap-2">
                  <button type="button" onClick={() => { setTwoFAStep('idle'); setOtpCode(''); }}
                    className="flex-1 border border-zinc-200 text-zinc-600 rounded-xl h-10 text-sm font-medium hover:bg-zinc-50 transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" disabled={loading2FA || otpCode.length < 6}
                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-xl h-10 flex items-center justify-center gap-2 text-sm font-semibold transition-colors">
                    {loading2FA ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar desativação'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </Section>

      </div>
    </div>
  );
}
