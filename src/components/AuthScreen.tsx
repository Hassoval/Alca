import { useState, type FormEvent } from 'react';
import {
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  Mail,
  Shield,
  User,
  UserCheck,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { AccessRole, DemoAccount, UserProfile } from '../types/alca';
import { DEMO_ACCOUNTS } from '../data/seedData';
import {
  accountToUserProfile,
  authenticateWithRoleAccounts,
  validateSignupCredentials,
} from '../utils/alcaLogic';
import { AlcaLogo } from './AlcaLogo';

interface AuthScreenProps {
  onAuthenticated: (user: UserProfile) => void;
}

const ROLE_META: Record<
  AccessRole,
  { label: string; summary: string; icon: typeof GraduationCap }
> = {
  estudante: {
    label: 'Estudante',
    summary: 'Publica notas, comenta, conversa e candidata-te a bolsas.',
    icon: GraduationCap,
  },
  professor: {
    label: 'Professor',
    summary: 'Publica e fixa anúncios académicos e modera discussões.',
    icon: UserCheck,
  },
  instituicao: {
    label: 'Instituição',
    summary: 'Publica avisos oficiais, cria bolsas/estágios e vê candidaturas.',
    icon: Building2,
  },
  admin: {
    label: 'Administrador',
    summary: 'Acesso total: publica, fixa e modera toda a plataforma.',
    icon: Shield,
  },
};

export function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [fullName, setFullName] = useState('');
  const [identifier, setIdentifier] = useState(DEMO_ACCOUNTS[0].email);
  const [password, setPassword] = useState(DEMO_ACCOUNTS[0].password);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (mode === 'forgot') {
      if (!identifier.trim().includes('@')) {
        setErrorMsg('Insere o teu e-mail académico para receber o link.');
        return;
      }
      setRecoverySent(true);
      return;
    }

    if (mode === 'signup') {
      const validation = validateSignupCredentials(
        fullName,
        identifier,
        password,
      );
      if (!validation.valid) {
        setErrorMsg(validation.error ?? 'Verifica os teus dados.');
        return;
      }
      setIsSubmitting(true);
      const cleanName = fullName.trim();
      const initials = cleanName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase() ?? '')
        .join('');
      onAuthenticated({
        ...accountToUserProfile(DEMO_ACCOUNTS[0]),
        id: `u-${Date.now()}`,
        name: cleanName,
        email: identifier.trim(),
        initials: initials || 'AL',
      });
      return;
    }

    const authResult = authenticateWithRoleAccounts(
      DEMO_ACCOUNTS,
      identifier,
      password,
    );
    if (!authResult.valid || !authResult.user) {
      setErrorMsg(authResult.error ?? 'Credenciais inválidas.');
      return;
    }

    setIsSubmitting(true);
    onAuthenticated(authResult.user!);
  };

  const handleSelectDemoAccount = (account: DemoAccount) => {
    setErrorMsg('');
    setMode('login');
    setIdentifier(account.email);
    setPassword(account.password);
  };

  const handleInstantDemoLogin = (account: DemoAccount) => {
    setIsSubmitting(true);
    onAuthenticated(accountToUserProfile(account));
  };

  return (
    <div className="min-h-screen w-full bg-[#F5F7FD] flex items-center justify-center p-0 sm:p-6 lg:p-10 relative overflow-hidden">
      {/* Gentle ambient calm aura */}
      <div
        className="pointer-events-none absolute -top-32 -left-24 w-96 h-96 rounded-full bg-indigo-200/45 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-32 -right-24 w-96 h-96 rounded-full bg-sky-200/45 blur-3xl"
        aria-hidden="true"
      />

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 bg-white/85 backdrop-blur-2xl sm:rounded-[32px] sm:border sm:border-white sm:shadow-[0_24px_80px_-20px_rgba(30,27,75,0.18)] overflow-hidden min-h-screen sm:min-h-[700px]">
        {/* Left / Top curved wave hero matching Screen 1 of the Figma prototype */}
        <div className="lg:col-span-5 relative bg-gradient-to-br from-[#6366F1] via-[#312E81] to-[#0A0F44] text-white px-7 pt-10 pb-14 sm:px-10 lg:py-12 flex flex-col justify-between overflow-hidden">
          <div
            className="pointer-events-none absolute top-0 right-0 w-72 h-72 rounded-full bg-indigo-400/20 blur-2xl -translate-y-1/3 translate-x-1/3"
            aria-hidden="true"
          />

          <div className="relative z-10 flex flex-col items-center lg:items-start text-center lg:text-left">
            <AlcaLogo tone="light" size="lg" />
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 text-3xl sm:text-4xl font-display font-bold tracking-tight"
            >
              {mode === 'login'
                ? 'Bem-Vindo'
                : mode === 'signup'
                  ? 'Criar Conta'
                  : 'Recuperar Acesso'}
            </motion.h1>
            <p className="mt-2.5 text-sm sm:text-base text-indigo-100/90 leading-relaxed max-w-sm">
              Conversas, publicações, anúncios docentes, pesquisa, bolsas e
              estágios num único ambiente sereno.
            </p>
          </div>

          {/* 4 RBAC Test Accounts Selector inside glass container */}
          <div className="relative z-10 mt-8 space-y-2.5">
            <p className="text-xs font-semibold text-indigo-200">
              Níveis de Acesso para Teste (preencher ou entrar direto)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
              {DEMO_ACCOUNTS.map((acc) => {
                const meta = ROLE_META[acc.role];
                const Icon = meta.icon;
                const isSelected =
                  identifier.toLowerCase() === acc.email.toLowerCase();
                return (
                  <div
                    key={acc.id}
                    className={`rounded-2xl backdrop-blur-md border p-2.5 flex items-center justify-between gap-2 transition-colors ${
                      isSelected
                        ? 'bg-white/20 border-white/50'
                        : 'bg-white/10 border-white/15 hover:bg-white/15'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectDemoAccount(acc)}
                      className="flex items-center gap-2.5 text-left min-w-0 flex-1"
                    >
                      <span className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-white" aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs font-semibold text-white truncate">
                          {meta.label} · {acc.email}
                        </span>
                        <span className="block text-[11px] text-indigo-100/85 truncate">
                          Pass: {acc.password}
                        </span>
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleInstantDemoLogin(acc)}
                      aria-label={`Entrar como ${meta.label}`}
                      className="px-2.5 py-1.5 rounded-lg bg-white text-[#0A0F44] text-[11px] font-semibold hover:bg-indigo-50 transition-colors shrink-0 whitespace-nowrap"
                    >
                      Entrar
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Organic curved wave bottom transition on mobile (matches Figma Screen 1) */}
          <svg
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            className="lg:hidden absolute bottom-0 left-0 w-full h-11 text-white"
            aria-hidden="true"
          >
            <path
              d="M0,36 C320,108 620,-12 960,54 C1180,96 1340,72 1440,36 L1440,120 L0,120 Z"
              fill="currentColor"
            />
          </svg>
        </div>

        {/* Right / Bottom Form Card */}
        <div className="lg:col-span-7 bg-white px-6 py-8 sm:px-12 sm:py-12 flex flex-col justify-center">
          <div className="w-full max-w-md mx-auto">
            <AnimatePresence mode="wait">
              <motion.form
                key={mode}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                onSubmit={handleSubmit}
                className="space-y-4"
                noValidate
              >
                {mode === 'signup' && (
                  <div>
                    <label
                      htmlFor="auth-fullname"
                      className="block text-xs font-medium text-slate-600 mb-1.5"
                    >
                      Nome completo
                    </label>
                    <div className="relative">
                      <User
                        className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"
                        aria-hidden="true"
                      />
                      <input
                        id="auth-fullname"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Ex: Maria José Eduardo"
                        className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50/60 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="auth-identifier"
                    className="block text-xs font-medium text-slate-600 mb-1.5"
                  >
                    E-mail ou Número de Telefone
                  </label>
                  <div className="relative">
                    <Mail
                      className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"
                      aria-hidden="true"
                    />
                    <input
                      id="auth-identifier"
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="E-mail ou Número de Telefone"
                      className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50/60 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all"
                    />
                  </div>
                </div>

                {mode !== 'forgot' && (
                  <div>
                    <label
                      htmlFor="auth-password"
                      className="block text-xs font-medium text-slate-600 mb-1.5"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <Lock
                        className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"
                        aria-hidden="true"
                      />
                      <input
                        id="auth-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full h-12 pl-10 pr-12 rounded-xl border border-slate-200 bg-slate-50/60 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={
                          showPassword
                            ? 'Ocultar password'
                            : 'Mostrar password'
                        }
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 min-w-[40px] min-h-[40px] flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {mode === 'login' && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMsg('');
                        setRecoverySent(false);
                        setMode('forgot');
                      }}
                      className="text-xs font-medium text-indigo-700 hover:text-indigo-900 py-1 px-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                      Esqueceste a Password?
                    </button>
                  </div>
                )}

                {errorMsg && (
                  <p
                    role="alert"
                    className="text-xs font-medium text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3.5 py-2.5"
                  >
                    {errorMsg}
                  </p>
                )}

                {recoverySent && mode === 'forgot' && (
                  <p
                    role="status"
                    className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2.5"
                  >
                    Enviámos instruções de recuperação para {identifier}.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 rounded-xl bg-[#0A0F44] hover:bg-[#141B66] active:scale-[0.99] text-white font-display font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/15 transition-all disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                >
                  <span>
                    {isSubmitting
                      ? 'A entrar...'
                      : mode === 'login'
                        ? 'Login'
                        : mode === 'signup'
                          ? 'Criar conta académica'
                          : 'Enviar ligação'}
                  </span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>

                {mode !== 'forgot' && (
                  <>
                    <div className="relative py-2 flex items-center">
                      <div className="flex-grow border-t border-slate-200" />
                      <span className="shrink-0 mx-3 text-xs text-slate-500">
                        Ou Iniciar Sessão com
                      </span>
                      <div className="flex-grow border-t border-slate-200" />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => handleInstantDemoLogin(DEMO_ACCOUNTS[0])}
                        aria-label="Entrar com Google"
                        className="h-12 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-sm font-semibold text-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                      >
                        <span className="text-base font-bold text-[#EA4335]">G</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInstantDemoLogin(DEMO_ACCOUNTS[0])}
                        aria-label="Entrar com Apple"
                        className="h-12 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-sm font-semibold text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                      >
                        Apple
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInstantDemoLogin(DEMO_ACCOUNTS[0])}
                        aria-label="Entrar com Facebook"
                        className="h-12 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-sm font-bold text-[#1877F2] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                      >
                        f
                      </button>
                    </div>
                  </>
                )}
              </motion.form>
            </AnimatePresence>

            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between gap-3 text-xs text-slate-600">
              {mode === 'login' ? (
                <p>
                  Não tens uma conta?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg('');
                      setMode('signup');
                    }}
                    className="font-semibold text-indigo-700 hover:text-indigo-900 underline-offset-2 hover:underline"
                  >
                    Criar conta
                  </button>
                </p>
              ) : (
                <p>
                  Já tens conta na ALÇA?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg('');
                      setMode('login');
                    }}
                    className="font-semibold text-indigo-700 hover:text-indigo-900 underline-offset-2 hover:underline"
                  >
                    Fazer Login
                  </button>
                </p>
              )}
              <span className="text-[11px] text-slate-400">
                4 níveis RBAC ativos
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
