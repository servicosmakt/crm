import React from 'react';
import {
  Users,
  Tags,
  CalendarCheck,
  CircleDollarSign,
  Calculator,
  MessageSquareShare,
  ShieldAlert,
  Lock,
  Sparkles,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { TabType, UserAuth } from '../types';
import { isBonusUnlocked, getDaysRemainingForBonus } from '../utils/storage';
import { BRANDING } from '../config/branding';

interface Props {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  userAuth: UserAuth;
  clientCount: number;
  appointmentCount: number;
  onLogout?: () => void;
}

interface NavItem {
  id: TabType;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  isBonus?: boolean;
  badge?: number;
}

export const Sidebar: React.FC<Props> = ({
  currentTab,
  onSelectTab,
  userAuth,
  clientCount,
  appointmentCount,
  onLogout,
}) => {
  const bonusUnlocked = isBonusUnlocked(userAuth);
  const daysRemaining = getDaysRemainingForBonus(userAuth.purchaseDate);
  const isAdmin = userAuth.role === 'admin';

  const mainItems: NavItem[] = [
    {
      id: 'clients',
      label: 'Clientes',
      shortLabel: 'Clientes',
      icon: Users,
      badge: clientCount,
    },
    {
      id: 'services',
      label: 'Serviços & Preços',
      shortLabel: 'Serviços',
      icon: Tags,
    },
    {
      id: 'appointments',
      label: 'Agenda Inteligente',
      shortLabel: 'Agenda',
      icon: CalendarCheck,
      badge: appointmentCount,
    },
  ];

  const bonusItems: NavItem[] = [
    {
      id: 'finance',
      label: 'Controle Financeiro',
      shortLabel: 'Financeiro',
      icon: CircleDollarSign,
      isBonus: true,
    },
    {
      id: 'pricing',
      label: 'Calculadora de Preços',
      shortLabel: 'Preços',
      icon: Calculator,
      isBonus: true,
    },
    {
      id: 'whatsapp',
      label: 'Mensagens WhatsApp',
      shortLabel: 'WhatsApp',
      icon: MessageSquareShare,
      isBonus: true,
    },
  ];

  const allMobileItems: NavItem[] = [
    ...mainItems,
    ...bonusItems,
    {
      id: 'settings',
      label: 'Backup & Configurações',
      shortLabel: 'Config',
      icon: Settings,
    },
    ...(isAdmin
      ? [
          {
            id: 'admin' as TabType,
            label: 'Painel Admin',
            shortLabel: 'Admin',
            icon: ShieldAlert,
          },
        ]
      : []),
  ];

  return (
    <>
      {/* Desktop & Tablet Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 text-slate-300 min-h-[calc(100vh-57px)] shrink-0 p-4">
        {/* Admin Section if Admin */}
        {isAdmin && (
          <div className="mb-4 pb-3 border-b border-purple-900/40">
            <div className="text-[11px] font-bold text-purple-400 uppercase tracking-wider px-3 mb-2 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
              <span>Administração</span>
            </div>
            <button
              onClick={() => onSelectTab('admin')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
                currentTab === 'admin'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-purple-300 bg-purple-950/40 hover:bg-purple-900/50 border border-purple-800/40'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 text-purple-300" />
                <span>Painel & Licenças</span>
              </div>
              <span className="text-[10px] bg-purple-500/30 text-purple-200 px-1.5 py-0.5 rounded-sm">
                Master
              </span>
            </button>
          </div>
        )}

        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
          Módulos Principais
        </div>

        <nav className="space-y-1">
          {mainItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-blue-700 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bonus Modules Section */}
        <div className="mt-6">
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              Módulos Bônus
            </span>
            {!bonusUnlocked && (
              <span className="text-[10px] bg-amber-950/80 text-amber-400 border border-amber-800/60 px-1.5 py-0.5 rounded-sm font-medium">
                {daysRemaining}d restantes
              </span>
            )}
          </div>

          <nav className="space-y-1">
            {bonusItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              const isLocked = !bonusUnlocked;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer relative group ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {isLocked ? (
                    <div className="flex items-center gap-1 text-amber-400" title="Liberado após os 7 dias de garantia">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded-sm">
                      Bônus
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Settings & Local Backup Section */}
        <div className="mt-auto pt-6 border-t border-slate-800/80">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Segurança & Dados
          </div>

          <button
            onClick={() => onSelectTab('settings')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
              currentTab === 'settings'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Settings className={`w-4 h-4 ${currentTab === 'settings' ? 'text-white' : 'text-slate-400'}`} />
            <span>Backup & Configurações</span>
          </button>

          {/* Sair da Conta */}
          {onLogout && (
            <button
              onClick={() => {
                if (confirm('Deseja desconectar sua conta agora?')) {
                  onLogout();
                }
              }}
              className="w-full mt-2 flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-transparent hover:border-red-900/40 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-red-400" />
              <span>Sair da Conta (Desconectar)</span>
            </button>
          )}
        </div>

        {/* Creator Signature / Credits */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 px-2 text-center">
          <p className="text-[10px] text-slate-400 font-medium">
            Desenvolvido por
          </p>
          <a
            href={BRANDING.creatorUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 hover:underline transition block mt-0.5"
          >
            {BRANDING.creatorName}
          </a>
          <p className="text-[9px] text-slate-500 mt-1 italic leading-tight">
            "{BRANDING.slogan}"
          </p>
        </div>
      </aside>

      {/* Mobile Top Scrollable Tab Bar */}
      <div className="md:hidden bg-slate-900 border-b border-slate-800 px-2 py-2 overflow-x-auto no-scrollbar flex items-center gap-1.5 sticky top-[57px] z-20">
        {allMobileItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          const isLocked = item.isBonus && !bonusUnlocked;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                isActive
                  ? item.id === 'admin'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.shortLabel}</span>
              {isLocked && <Lock className="w-3 h-3 text-amber-400 ml-0.5" />}
            </button>
          );
        })}
      </div>
    </>
  );
};
