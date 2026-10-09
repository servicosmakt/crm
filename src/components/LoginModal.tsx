import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Mail,
  Key,
  ArrowRight,
  LogOut,
  ShieldAlert,
  AlertCircle,
  Lock,
} from 'lucide-react';
import { UserAuth, LicenseUser } from '../types';
import { BRANDING } from '../config/branding';

interface Props {
  userAuth: UserAuth;
  registeredUsers?: LicenseUser[];
  onLogin: (updatedAuth: UserAuth) => void;
  onLogout?: () => void;
  onClose?: () => void;
  isInitialScreen?: boolean;
  isAdminRoute?: boolean;
}

export const LoginModal: React.FC<Props> = ({
  userAuth,
  registeredUsers = [],
  onLogin,
  onLogout,
  onClose,
  isInitialScreen = false,
  isAdminRoute = false,
}) => {
  const [isAdminMode, setIsAdminMode] = useState(isAdminRoute);
  const [email, setEmail] = useState('');
  const [accessKey, setAccessKey] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [logoClickCount, setLogoClickCount] = useState(0);

  // Sync if route has admin
  useEffect(() => {
    if (isAdminRoute) {
      setIsAdminMode(true);
    }
  }, [isAdminRoute]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedKey = accessKey.trim();

    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      setErrorMsg('Por favor, informe um e-mail válido.');
      return;
    }

    if (!normalizedKey) {
      setErrorMsg('Por favor, informe a senha ou chave de acesso.');
      return;
    }

    // 1. Check in registered users list first (including the admin and any updated password)
    const foundUser = registeredUsers.find(
      (u) =>
        u.email.toLowerCase() === normalizedEmail &&
        u.accessKey.trim() === normalizedKey
    );

    if (foundUser) {
      if (isAdminMode && foundUser.role !== 'admin') {
        setErrorMsg('Acesso restrito. Estas credenciais não possuem privilégios de administradora.');
        return;
      }

      onLogin({
        isLoggedIn: true,
        buyerEmail: foundUser.email,
        buyerName: foundUser.name,
        purchaseDate: foundUser.purchaseDate,
        isUnlockedOverride: foundUser.isUnlockedOverride,
        role: foundUser.role,
      });
      if (onClose) onClose();
      return;
    }

    // 2. Initial fallback for Master Admin (if not changed yet)
    if (
      normalizedEmail === 'gleicieneads@gmail.com' &&
      (normalizedKey === 'GR-ADMIN-2026' || normalizedKey === 'admin123')
    ) {
      onLogin({
        isLoggedIn: true,
        buyerEmail: 'gleicieneads@gmail.com',
        buyerName: 'Gleiciene Rocha',
        purchaseDate: '2026-01-01',
        isUnlockedOverride: true,
        role: 'admin',
      });
      if (onClose) onClose();
      return;
    }

    // If currently in Admin-Only Mode, reject non-admin users
    if (isAdminMode) {
      setErrorMsg('Acesso restrito. Estas credenciais não possuem privilégios de administradora.');
      return;
    }

    // 3. Fallback for test user
    if (normalizedEmail === 'usuarioteste@gmail.com' && normalizedKey === '123') {
      onLogin({
        isLoggedIn: true,
        buyerEmail: 'usuarioteste@gmail.com',
        buyerName: 'Usuário de Teste',
        purchaseDate: new Date().toISOString().split('T')[0],
        isUnlockedOverride: false, // Trava dos 7 dias ativa para teste
        role: 'tester',
      });
      if (onClose) onClose();
      return;
    }

    // 4. Invalid credentials
    setErrorMsg(
      'E-mail ou chave de acesso incorretos. Verifique suas credenciais de compra ou entre em contato com o suporte.'
    );
  };

  // Discreet Admin mode toggle (Easter egg: click logo 3 times)
  const handleSecretLogoClick = () => {
    const next = logoClickCount + 1;
    setLogoClickCount(next);
    if (next >= 3) {
      setIsAdminMode((prev) => !prev);
      setLogoClickCount(0);
      setErrorMsg('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div
          className={`p-6 text-white text-center relative transition-all duration-300 ${
            isAdminMode
              ? 'bg-gradient-to-r from-slate-950 via-purple-950 to-slate-900 border-b border-purple-800/40'
              : 'bg-gradient-to-r from-slate-900 via-blue-950 to-blue-900'
          }`}
        >
          {/* Logo / Shield (Secret click target) */}
          <button
            type="button"
            onClick={handleSecretLogoClick}
            className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl border mb-3 shadow-inner transition cursor-pointer select-none active:scale-95 ${
              isAdminMode
                ? 'bg-purple-600/30 border-purple-400/40 text-purple-300'
                : 'bg-blue-600/30 border-blue-400/30 text-white'
            }`}
            title="GR CRM"
          >
            {isAdminMode ? (
              <ShieldAlert className="w-8 h-8 text-purple-400 animate-pulse" />
            ) : (
              <ShieldCheck className="w-8 h-8 text-cyan-400" />
            )}
          </button>

          <h2 className="text-xl md:text-2xl font-bold tracking-tight">
            {isAdminMode ? 'Área da Administradora' : BRANDING.appName}
          </h2>

          <p className="text-xs text-blue-200 mt-1 italic max-w-sm mx-auto leading-relaxed">
            {isAdminMode
              ? 'Painel Restrito de Gestão & Licenças'
              : `"${BRANDING.slogan}"`}
          </p>

          {!isInitialScreen && onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-4">
          {/* If already logged in and just viewing modal from top menu */}
          {!isInitialScreen && userAuth.isLoggedIn && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 mb-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Conta Conectada:</span>
                {userAuth.role === 'admin' ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                    👑 Administradora
                  </span>
                ) : userAuth.role === 'tester' ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    🧪 Teste
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    👤 Cliente
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold text-slate-900 truncate">
                {userAuth.buyerName || userAuth.buyerEmail}
              </p>
              <p className="text-xs text-slate-500 truncate">{userAuth.buyerEmail}</p>

              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full mt-2 py-2.5 px-3 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair desta Conta (Desconectar)</span>
                </button>
              )}
            </div>
          )}

          {/* Form */}
          {(!userAuth.isLoggedIn || isInitialScreen) && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  {isAdminMode ? 'E-mail da Administradora' : 'E-mail de Acesso'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={isAdminMode ? 'gleicieneads@gmail.com' : 'seu-email@exemplo.com'}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  {isAdminMode ? 'Senha Master / Chave Admin' : 'Chave de Acesso / Licença'}
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={accessKey}
                    onChange={(e) => setAccessKey(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Botão de Entrar */}
              <button
                type="submit"
                className={`w-full mt-2 py-3 px-4 rounded-xl text-white font-semibold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98 ${
                  isAdminMode
                    ? 'bg-purple-700 hover:bg-purple-800'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                <span>{isAdminMode ? 'Entrar no Painel Master' : 'Acessar Meu Painel'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Link para alternar modo se estiver na tela de admin */}
              {isAdminMode && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAdminMode(false);
                      setErrorMsg('');
                    }}
                    className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
                  >
                    ← Voltar ao login de clientes
                  </button>
                </div>
              )}
            </form>
          )}

          {/* Footer com assinatura */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>
              Desenvolvido por{' '}
              <a
                href={BRANDING.creatorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-blue-600 hover:underline"
              >
                {BRANDING.creatorName}
              </a>
            </span>

            {/* Link discreto para Administradora */}
            {!isAdminMode && (
              <button
                type="button"
                onClick={() => {
                  setIsAdminMode(true);
                  setErrorMsg('');
                }}
                className="text-[10px] text-slate-400 hover:text-slate-600 flex items-center gap-1 cursor-pointer transition"
                title="Área restrita de gestão"
              >
                <Lock className="w-2.5 h-2.5" />
                <span>Gestão</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
