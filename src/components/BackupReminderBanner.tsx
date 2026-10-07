import React, { useState } from 'react';
import { HardDrive, Download, X, CheckCircle2, ShieldAlert } from 'lucide-react';
import { StorageStats } from '../utils/storage';

interface Props {
  stats: StorageStats;
  onExportBackup: () => void;
}

export const BackupReminderBanner: React.FC<Props> = ({ stats, onExportBackup }) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  if (isDismissed || !stats.needsBackup) {
    return null;
  }

  const handleBackupClick = async () => {
    onExportBackup();
    setJustSaved(true);
    setTimeout(() => {
      setIsDismissed(true);
    }, 3000);
  };

  const isWarningOrCritical = stats.status !== 'safe';

  return (
    <div
      className={`mb-5 p-3.5 sm:p-4 rounded-2xl border transition-all shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top duration-200 ${
        isWarningOrCritical
          ? 'bg-amber-50 border-amber-300 text-amber-900'
          : 'bg-blue-50/90 border-blue-200 text-blue-950'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`p-2 rounded-xl shrink-0 ${
            isWarningOrCritical
              ? 'bg-amber-200/80 text-amber-900'
              : 'bg-blue-600 text-white'
          }`}
        >
          {isWarningOrCritical ? (
            <ShieldAlert className="w-4 h-4" />
          ) : (
            <HardDrive className="w-4 h-4" />
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-xs sm:text-sm font-bold">
              {isWarningOrCritical
                ? 'Atenção ao Armazenamento do Aparelho'
                : 'Lembrete de Segurança dos Dados'}
            </h4>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-white/80 border border-slate-200">
              {stats.usedKb} KB usados ({stats.percentage}%)
            </span>
          </div>

          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
            {justSaved ? (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Backup oficial atualizado com sucesso!
              </span>
            ) : isWarningOrCritical ? (
              'O espaço do navegador está sendo preenchido. Salve uma cópia de segurança para garantir seus registros.'
            ) : (
              'Você tem novos cadastros no CRM. Atualize seu arquivo oficial único para garantir que seus dados nunca se percam.'
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        {!justSaved && (
          <button
            onClick={handleBackupClick}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer ${
              isWarningOrCritical
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Atualizar Backup Oficial</span>
          </button>
        )}

        <button
          onClick={() => setIsDismissed(true)}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-black/5 transition"
          title="Fechar aviso temporariamente"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
