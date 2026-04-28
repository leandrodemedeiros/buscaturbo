import { db } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import React, { useState } from 'react';
import { X, LogIn, UserPlus, Mail, Lock, Phone, User, ArrowLeft, Loader2, Eye, EyeOff, Smartphone, Shield } from 'lucide-react';

const inputClass = "w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-1 focus:ring-red-100 bg-white";
const labelClass = "block text-xs font-medium text-zinc-600 mb-1";

export default function LoginModal({ open, onClose, onSuccess }) {
  const [tab, setTab] = useState('login'); // 'login' | 'register' | 'forgot' | 'mfa'
  const [mfaFactorId, setMfaFactorId] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [forgotEmail, setForgotEmail] = useState('');

  const reset = () => {
    setError('');
    setSuccess('');
    setLoading(false);
  };

  const changeTab = (t) => { reset(); setTab(t); };

  // ── Login com e-mail e senha ──
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password,
      });
      if (error) throw error;

      // Verificar se o usuário tem 2FA ativo
      const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aalData?.nextLevel === 'aal2' && aalData?.nextLevel !== aalData?.currentLevel) {
        // Buscar o factor_id do TOTP ativo
        const { data: factorsData } = await supabase.auth.mfa.listFactors();
        const totpFactor = factorsData?.totp?.find(f => f.status === 'verified');
        if (totpFactor) {
          setMfaFactorId(totpFactor.id);
          setTab('mfa');
          setLoading(false);
          return;
        }
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message === 'Invalid login credentials'
        ? 'E-mail ou senha incorretos.'
        : err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMfaVerify = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: mfaFactorId });
      if (challengeError) throw challengeError;
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: mfaFactorId,
        challengeId: challengeData.id,
        code: mfaCode,
      });
      if (verifyError) throw verifyError;
      onSuccess?.();
      onClose();
    } catch (err) {
      setError('Código inválido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // ── Login com Google ──
  const handleGoogleLogin = () => {
    db.auth.redirectToLogin(window.location.href);
  };

  // ── Cadastro ──
  const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: registerForm.email,
        password: registerForm.password,
        options: {
          data: {
            full_name: registerForm.name,
            phone: registerForm.phone,
          },
        },
      });
      if (error) throw error;
      setSuccess('Conta criada! Verifique seu e-mail para confirmar o cadastro.');
    } catch (err) {
      setError(err.message === 'User already registered'
        ? 'Este e-mail já está cadastrado.'
        : err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Recuperar senha ──
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSuccess('Enviamos um link de redefinição para o seu e-mail.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            {(tab === 'register' || tab === 'forgot' || tab === 'mfa') && (
              <button onClick={() => changeTab('login')} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-zinc-100">
                <ArrowLeft className="w-4 h-4 text-zinc-500" />
              </button>
            )}
            <div>
              <h2 className="font-bold text-zinc-900">
                {tab === 'login' && 'Entrar'}
                {tab === 'register' && 'Criar conta'}
                {tab === 'forgot' && 'Recuperar senha'}
                {tab === 'mfa' && 'Verificação em dois fatores'}
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                {tab === 'login' && 'Acesse sua conta BuscaTurbo'}
                {tab === 'register' && 'Preencha seus dados para começar'}
                {tab === 'forgot' && 'Enviaremos um link para seu e-mail'}
                {tab === 'mfa' && 'Digite o código do seu app autenticador'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-100">
            <X className="w-4 h-4 text-zinc-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">

          {/* Mensagens de erro / sucesso */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">
              {success}
            </div>
          )}

          {/* ── ABA: LOGIN ── */}
          {tab === 'login' && !success && (
            <>
              <form onSubmit={handleEmailLogin} className="space-y-3">
                <div>
                  <label className={labelClass}>E-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type="email" required placeholder="seu@email.com"
                      className={inputClass + " pl-9"}
                      value={loginForm.email}
                      onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type={showPassword ? 'text' : 'password'} required placeholder="••••••••"
                      className={inputClass + " pl-9 pr-9"}
                      value={loginForm.password}
                      onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                    />
                    <button type="button" onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button type="button" onClick={() => changeTab('forgot')}
                    className="text-xs text-red-600 hover:underline">
                    Esqueci minha senha
                  </button>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-xl h-11 flex items-center justify-center gap-2 font-semibold text-sm transition-colors">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                  Entrar
                </button>
              </form>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-zinc-200" />
                <span className="text-xs text-zinc-400">ou</span>
                <div className="flex-1 h-px bg-zinc-200" />
              </div>

              <button onClick={handleGoogleLogin}
                className="w-full border border-zinc-200 hover:bg-zinc-50 rounded-xl h-11 flex items-center justify-center gap-2 text-sm font-medium text-zinc-700 transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuar com Google
              </button>

              <p className="text-center text-xs text-zinc-500">
                Não tem conta?{' '}
                <button onClick={() => changeTab('register')} className="text-red-600 font-medium hover:underline">
                  Cadastre-se grátis
                </button>
              </p>
            </>
          )}

          {/* ── ABA: CADASTRO ── */}
          {tab === 'register' && !success && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className={labelClass}>Nome completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input type="text" required placeholder="Seu nome"
                    className={inputClass + " pl-9"}
                    value={registerForm.name}
                    onChange={e => setRegisterForm(f => ({ ...f, name: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input type="email" required placeholder="seu@email.com"
                    className={inputClass + " pl-9"}
                    value={registerForm.email}
                    onChange={e => setRegisterForm(f => ({ ...f, email: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Telefone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input type="tel" required placeholder="(11) 99999-9999"
                    className={inputClass + " pl-9"}
                    value={registerForm.phone}
                    onChange={e => setRegisterForm(f => ({ ...f, phone: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input type={showPassword ? 'text' : 'password'} required placeholder="Mínimo 6 caracteres"
                    minLength={6}
                    className={inputClass + " pl-9 pr-9"}
                    value={registerForm.password}
                    onChange={e => setRegisterForm(f => ({ ...f, password: e.target.value }))}
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-xl h-11 flex items-center justify-center gap-2 font-semibold text-sm transition-colors">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                Criar conta
              </button>
              <p className="text-center text-xs text-zinc-500">
                Já tem conta?{' '}
                <button type="button" onClick={() => changeTab('login')} className="text-red-600 font-medium hover:underline">
                  Entrar
                </button>
              </p>
            </form>
          )}

          {/* ── ABA: ESQUECI A SENHA ── */}
          {tab === 'forgot' && !success && (
            <form onSubmit={handleForgotPassword} className="space-y-3">
              <div>
                <label className={labelClass}>E-mail da sua conta</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input type="email" required placeholder="seu@email.com"
                    className={inputClass + " pl-9"}
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                  />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-xl h-11 flex items-center justify-center gap-2 font-semibold text-sm transition-colors">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                Enviar link de recuperação
              </button>
            </form>
          )}

          {/* ── ABA: MFA ── */}
          {tab === 'mfa' && (
            <form onSubmit={handleMfaVerify} className="space-y-4">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                <Smartphone className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-800">Abra seu app autenticador (Google Authenticator, Authy etc.) e insira o código de 6 dígitos.</p>
              </div>
              <div>
                <label className={labelClass}>Código de verificação</label>
                <input
                  type="text" inputMode="numeric" maxLength={6} pattern="[0-9]{6}" required
                  autoFocus
                  className={inputClass + " text-center text-2xl tracking-[0.5em] font-mono"}
                  placeholder="000000"
                  value={mfaCode}
                  onChange={e => setMfaCode(e.target.value.replace(/\D/g, ''))}
                />
              </div>
              <button type="submit" disabled={loading || mfaCode.length < 6}
                className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-xl h-11 flex items-center justify-center gap-2 font-semibold text-sm transition-colors">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                Verificar e entrar
              </button>
            </form>
          )}

        </div>

        <div className="px-6 pb-5 text-center text-xs text-zinc-400">
          🔒 Seus dados são protegidos e nunca compartilhados.
        </div>
      </div>
    </div>
  );
}
