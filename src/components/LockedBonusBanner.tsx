import React from 'react';
import { Lock, Sparkles, Clock, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { UserAuth } from '../types';
import { getDaysRemainingForBonus, getDaysSincePurchase } from '../utils/storage';

interface Props {
  moduleName: string;
  moduleDescription: string;
  userAuth: UserAuth;
  onUnlockOverrideToggle: () => void;
}

export const LockedBonusBanner: React.FC<Props> = ({
  moduleName,
  moduleDescription,
  userAuth,
  onUnlockOverrideToggle,
}) => {
  const daysRemaining = getDaysRemainingForBonus(userAuth.purchaseDate);
  const daysPassed = getDaysSincePurchase(userAuth.purchaseDate);
  const purchaseFormatted = userAuth.purchaseDate
    ? new Date(userAuth.purchaseDate).toLocaleDateString('pt-BR')
    : 'Não definida';

  return (
    <div className="max-w-2xl mx-auto my-8 p-6 md:p-8 bg-linear-to-b from-slate-900 via-blue-950 to-slate-900 rounded-3xl text-white shadow-xl border border-blue-800/40 text-center relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Lock badge */}
      <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/30 mb-5">
        <Lock className="w-8 h-8" />
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-3">
        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
        Módulo Bônus Exclusivo
      </div>

      <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">
        {moduleName}
      </h2>
      <p className="text-slate-300 text-sm md:text-base max-w-lg mx-auto mb-6">
        {moduleDescription}
      </p>

      {/* 7-day status card */}
      <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 md:p-5 border border-slate-700/80 text-left max-w-md mx-auto mb-6 shadow-inner">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span>Período de Carência / Garantia</span>
          <span className="font-semibold text-amber-400">{daysPassed} de 7 dias decorridos</span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2.5 bg-slate-700 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-linear-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (daysPassed / 7) * 100)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>
              Liberado automaticamente em{' '}
              <strong className="text-white">{daysRemaining} {daysRemaining === 1 ? 'dia' : 'dias'}</strong>
            </span>
          </div>
          <span className="text-slate-400">Compra: {purchaseFormatted}</span>
        </div>
      </div>

      {/* Info notice */}
      <div className="flex items-start gap-3 bg-blue-900/30 border border-blue-700/40 rounded-xl p-3.5 text-left text-xs text-blue-200 max-w-md mx-auto">
        <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <p>
          Este módulo especial faz parte do seu pacote de bônus premium. Conforme a regra de proteção, ele será liberado automaticamente após o 7º dia da sua compra.
        </p>
      </div>
    </div>
  );
};
