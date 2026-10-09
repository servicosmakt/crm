import React from 'react';
import {
  Sparkles,
  Lock,
  Unlock,
  ShieldCheck,
  User,
  ShieldAlert,
  LogOut,
} from 'lucide-react';
import { UserAuth, TabType } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { isBonusUnlocked, getDaysRemainingForBonus, getDaysSincePurchase } from '../utils/storage';

interface Props {
  userAuth: UserAuth;
  businessName: string;
  onOpenLogin: () => void;
  onSelectTab: (tab: TabType) => void;
  currentTab: TabType;
  onToggleBonusOverride: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<Props> = ({
  userAuth,
  businessName,
  onOpenLogin,
  onSelectTab,
  currentTab,
  onToggleBonusOverride,
  onLogout,
}) => {
  const bonusUnlocked = isBonusUnlocked(userAuth);
  const daysPassed = getDaysSincePurchase(userAuth.purchaseDate);
  const daysRemaining = getDaysRemainingForBonus(userAuth.purchaseDate);
  const isAdmin = userAuth.role === 'admin';

  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white px-4 lg:px-6 py-2.5 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Brand logo & Title */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => onSelectTab('clients')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center font-black text-white text-base shadow-sm group-hover:scale-105 transition">
              GR
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm sm:text-base text-white tracking-tight">
                  GR CRM
                </span>
                <span className="text-[10px] font-semibold uppercase bg-blue-600/30 text-blue-300 px-1.5 py-0.5 rounded-sm border border-blue-500/30">
                  Autônomo
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block truncate max-w-[200px]">
                {businessName || 'Gestão Profissional'}
              </p>
            </div>
          </div>
        </div>

        {/* Center / Status Pill for 7 Days Rule & Admin Access */}
        <div className="hidden md:flex items-center gap-2">
          {isAdmin ? (
            <button
              onClick={() => onSelectTab('admin')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition ${
                currentTab === 'admin'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-purple-950/60 border border-purple-500/40 text-purple-300 hover:bg-purple-900/60'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-purple-300" />
              <span>Painel Administradora</span>
            </button>
          ) : bonusUnlocked ? (
            <div
              onClick={onToggleBonusOverride}
              title="Clique para alternar simulação dos bônus"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-medium cursor-pointer hover:bg-emerald-900/60 transition"
            >
              <Unlock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Bônus 100% Desbloqueados</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-medium">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Módulos bônus liberam em {daysRemaining} {daysRemaining === 1 ? 'dia' : 'dias'}</span>
            </div>
          )}
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-2">
          {/* PWA Install Button */}
          <PWAInstallButton compact />

          {/* User Account Button */}
          <button
            onClick={onOpenLogin}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition cursor-pointer"
            title="Ver detalhes da conta conectada"
          >
            <div className="w-5 h-5 rounded-full bg-blue-600/30 flex items-center justify-center text-blue-300">
              <User className="w-3.5 h-3.5" />
            </div>
            <span className="hidden sm:inline max-w-[110px] truncate">
              {userAuth.buyerName ? userAuth.buyerName.split(' ')[0] : 'Conta'}
            </span>
            {userAuth.role === 'admin' && (
              <span className="text-[9px] px-1 bg-purple-500/30 text-purple-300 rounded-sm hidden sm:inline">
                Admin
              </span>
            )}
          </button>

          {/* Logout button */}
          {onLogout && (
            <button
              onClick={() => {
                if (confirm('Deseja desconectar da conta e voltar para a tela de login?')) {
                  onLogout();
                }
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 text-red-300 hover:text-white text-xs font-semibold transition cursor-pointer"
              title="Sair desta conta (desconectar)"
            >
              <LogOut className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
