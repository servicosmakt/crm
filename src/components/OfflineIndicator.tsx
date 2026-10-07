import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-xl bg-slate-900 text-white px-3.5 py-2 text-xs font-medium shadow-xl border border-slate-700 animate-in slide-in-from-bottom duration-200">
      <WifiOff className="w-4 h-4 text-amber-400 animate-pulse" />
      <span>Modo Offline Ativo — Todos os dados continuam salvos com segurança no seu aparelho!</span>
    </div>
  );
};
