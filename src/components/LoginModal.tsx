import React, { useState } from 'react';
import { ShieldCheck, Mail, Calendar, Key, CheckCircle, Sparkles, User, ArrowRight } from 'lucide-react';
import { UserAuth } from '../types';
import { getDaysSincePurchase, getDaysRemainingForBonus } from '../utils/storage';
import { BRANDING } from '../config/branding';

interface Props {
  userAuth: UserAuth;
  onLogin: (updatedAuth: UserAuth) => void;
  onLogout?: () => void;
  onClose?: () => void;
  isInitialScreen?: boolean;
}

export const LoginModal: React.FC<Props> = ({
  userAuth,
  onLogin,
  onLogout,
  onClose,
  isInitialScreen = false,
}) => {
  const [email, setEmail] = useState(userAuth.buyerEmail || '');
  const [name, setName] = useState(userAuth.buyerName || '');
  const [purchaseDate, setPurchaseDate] = useState(
    isInitialScreen
      ? new Date().toISOString().split('T')[0]
      : userAuth.purchaseDate || new Date().toISOString().split('T')[0]
  );
  const [overrideUnlock, setOverrideUnlock] = useState(
    isInitialScreen ? false : (userAuth.isUnlockedOverride ?? false)
  );
  const [showSimulations, setShowSimulations] = useState(!isInitialScreen);
  const [accessKey, setAccessKey] = useState('GR-PRO-2026');
  const [errorMsg, setErrorMsg] = useState('');

  const daysPassed = getDaysSincePurchase(purchaseDate);
  const daysRemaining = getDaysRemainingForBonus(purchaseDate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Por favor, informe um e-mail válido de comprador.');
      return;
    }

    onLogin({
      isLoggedIn: true,
      buyerEmail: email.trim(),
      buyerName: name.trim() || 'Profissional Autônoma',
      purchaseDate,
      isUnlockedOverride: overrideUnlock,
    });

    if (onClose) {
      onClose();
    }
  };

  const handleSimulateDays = (daysAgo: number, forceUnlock = false) => {
    const targetDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setPurchaseDate(targetDate);
    setOverrideUnlock(forceUnlock);
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md`}>
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header with Deep Blue brand gradient */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-blue-900 p-6 text-white text-center relative">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600/30 border border-blue-400/30 text-white mb-3 shadow-inner">
            <ShieldCheck className="w-8 h-8 text-cyan-400" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">
            GR CRM Autônomo
          </h2>
          <p className="text-xs text-blue-200 mt-1 italic max-w-sm mx-auto leading-relaxed">
            "A tua estrutura de atendimento e vendas no WhatsApp organizada e pronta para escalar."
          </p>

          {!isInitialScreen && onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10"
            >
              ✕
            </button>
          )}
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              E-mail do Comprador / Aluno
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu-email@exemplo.com"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Seu Nome / Espaço
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome do Profissional"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Chave de Acesso / Licença
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={accessKey}
                  onChange={(e) => setAccessKey(e.target.value)}
                  placeholder="GR-PRO-2026"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          {/* Botão de Entrar */}
          <button
            type="submit"
            className="w-full mt-4 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-semibold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{isInitialScreen ? 'Ativar e Acessar Meu Painel' : 'Salvar Dados de Acesso'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {!isInitialScreen && onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="w-full py-2 px-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition cursor-pointer"
            >
              Desconectar e Voltar à Tela de Login
            </button>
          )}

          <div className="pt-2 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-500">
              Desenvolvido por{' '}
              <a
                href={BRANDING.creatorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-blue-600 hover:underline"
              >
                {BRANDING.creatorName}
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
