import React, { useRef, useState } from 'react';
import {
  ShieldCheck,
  Download,
  Upload,
  Lock,
  Unlock,
  RefreshCw,
  HardDrive,
  Database,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Building,
  User,
  Sparkles,
} from 'lucide-react';
import { CRMData, UserAuth } from '../../types';
import {
  exportBackupFile,
  parseAndValidateBackup,
  getDaysSincePurchase,
  getDaysRemainingForBonus,
  isBonusUnlocked,
  getStorageStats,
  INITIAL_DATA,
} from '../../utils/storage';
import { PWAInstallButton } from '../PWAInstallButton';
import { BRANDING } from '../../config/branding';

interface Props {
  crmData: CRMData;
  onUpdateBusinessInfo: (name: string, owner: string) => void;
  onUpdateUserAuth: (auth: UserAuth) => void;
  onRestoreData: (restoredData: CRMData) => void;
  onResetToDemoData: () => void;
  onClearAllData: () => void;
  onLogout?: () => void;
}

export const SettingsTab: React.FC<Props> = ({
  crmData,
  onUpdateBusinessInfo,
  onUpdateUserAuth,
  onRestoreData,
  onResetToDemoData,
  onClearAllData,
  onLogout,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [businessName, setBusinessName] = useState(crmData.businessName);
  const [businessOwner, setBusinessOwner] = useState(crmData.businessOwner);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState<string | null>(null);

  const daysPassed = getDaysSincePurchase(crmData.userAuth.purchaseDate);
  const daysRemaining = getDaysRemainingForBonus(crmData.userAuth.purchaseDate);
  const bonusUnlocked = isBonusUnlocked(crmData.userAuth);
  const storageStats = getStorageStats(crmData);

  const handleSaveBusinessInfo = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateBusinessInfo(businessName.trim(), businessOwner.trim());
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleExportBackup = async () => {
    const updatedDate = await exportBackupFile(crmData);
    setRestoreStatus('✓ Arquivo oficial de backup salvo com sucesso: GR-CRM-Backup-Oficial.json');
    setTimeout(() => setRestoreStatus(null), 5000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = parseAndValidateBackup(content);
      if (res.success && res.data) {
        onRestoreData(res.data);
        setRestoreStatus('Backup restaurado com sucesso! Seus dados foram sincronizados.');
        setTimeout(() => setRestoreStatus(null), 5000);
      } else {
        alert(res.error || 'Erro ao processar arquivo de backup.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleToggleOverride = () => {
    onUpdateUserAuth({
      ...crmData.userAuth,
      isUnlockedOverride: !crmData.userAuth.isUnlockedOverride,
    });
  };

  const handleSetPurchaseDays = (daysAgo: number) => {
    const dateStr = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    onUpdateUserAuth({
      ...crmData.userAuth,
      purchaseDate: dateStr,
      isUnlockedOverride: false,
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-blue-600" />
          Configurações, Segurança & Backup Local
        </h1>
        <p className="text-xs md:text-sm text-slate-500 mt-1">
          Seus dados pertencem a você. Gerencie backups locais por arquivo e ajuste as preferências do seu negócio.
        </p>
      </div>

      {restoreStatus && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-800 text-sm flex items-center gap-2 font-medium animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{restoreStatus}</span>
        </div>
      )}

      {/* 1. Privacy Banner */}
      <div className="bg-linear-to-r from-blue-900 via-slate-900 to-slate-950 text-white rounded-2xl p-6 border border-blue-800 shadow-md">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-600/30 rounded-2xl text-cyan-300 border border-blue-500/30 shrink-0">
            <HardDrive className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-base font-bold text-white">
              Privacidade Absoluta: Seus dados nunca saem do seu dispositivo
            </h2>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              O <strong>GR CRM Autônomo</strong> opera 100% de forma local (Client-Side). Seus clientes, faturamento, anotações e serviços ficam armazenados exclusivamente na memória segura (LocalStorage) do navegador deste aparelho. Nenhum servidor externo tem acesso às suas informações comerciais.
            </p>
            <div className="pt-2 flex flex-wrap gap-4 text-xs text-blue-200">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                Sem mensalidades de banco de dados
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                Funciona sem internet (Offline)
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                Controle total via Backup JSON
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Monitor de Armazenamento Local & Saúde dos Dados */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Monitor de Armazenamento Local
            </h3>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                storageStats.status === 'safe'
                  ? 'bg-emerald-100 text-emerald-800'
                  : storageStats.status === 'warning'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {storageStats.status === 'safe' ? 'Espaço Abundante ✓' : 'Atenção ao Espaço'}
            </span>
          </div>

          <span className="text-xs text-slate-500 font-medium">
            {storageStats.usedKb} KB de {storageStats.capacityKb} KB ({storageStats.percentage}% usado)
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              storageStats.status === 'safe'
                ? 'bg-blue-600'
                : storageStats.status === 'warning'
                ? 'bg-amber-500'
                : 'bg-red-600'
            }`}
            style={{ width: `${Math.max(2, storageStats.percentage)}%` }}
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-1 pt-1">
          <span>
            Total de registros: <strong>{storageStats.totalRecords}</strong> ({crmData.clients.length} clientes, {crmData.appointments.length} agendamentos, {crmData.transactions.length} lançamentos)
          </span>
          <span>
            Último backup: <strong>{storageStats.lastBackupFormatted}</strong>
          </span>
        </div>
      </div>

      {/* 3. Backup & Restore Cards (Arquivo Padronizado) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Export Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-2xs space-y-4">
          <div>
            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm mb-1">
              <Download className="w-5 h-5" />
              <span>Salvar Backup Oficial (1 Clique)</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Salva todos os dados em um único arquivo oficial (<code>GR-CRM-Backup-Oficial.json</code>). O sistema permite atualizar o mesmo arquivo diretamente sem criar dezenas de backups duplicados no seu aparelho.
            </p>
          </div>

          <button
            onClick={handleExportBackup}
            className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-blue-900 text-white font-semibold text-xs md:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-98"
          >
            <Download className="w-4 h-4" />
            <span>Atualizar Arquivo de Backup Oficial</span>
          </button>
        </div>

        {/* Restore Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-2xs space-y-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm mb-1">
              <Upload className="w-5 h-5" />
              <span>Restaurar Backup Anterior</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Trocou de celular ou computador? Selecione o seu arquivo <code>GR-CRM-Backup-Oficial.json</code> salvo anteriormente para recuperar 100% da sua base de dados instantaneamente.
            </p>
          </div>

          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
              id="backup-file-input"
            />
            <label
              htmlFor="backup-file-input"
              className="w-full py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs md:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs active:scale-98"
            >
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>Carregar Arquivo JSON</span>
            </label>
          </div>
        </div>
      </div>

      {/* 3. Business Profile Settings */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
          <Building className="w-4 h-4 text-blue-600" />
          Dados do Espaço & Profissional
        </h2>

        <form onSubmit={handleSaveBusinessInfo} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Nome do Negócio / Studio
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Ex: Studio Bela Face"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Nome do Profissional Responsável
              </label>
              <input
                type="text"
                value={businessOwner}
                onChange={(e) => setBusinessOwner(e.target.value)}
                placeholder="Ex: Gleiciene Silva"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {saveSuccess ? (
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Dados do negócio atualizados com sucesso!
              </span>
            ) : <span />}

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs md:text-sm shadow-xs transition cursor-pointer"
            >
              Salvar Dados
            </button>
          </div>
        </form>
      </div>

      {/* 4. Status da Licença & Período de Garantia */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Status da Licença & Módulos Bônus
          </h2>
          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
            bonusUnlocked ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
          }`}>
            {bonusUnlocked ? 'Bônus 100% Liberados' : `Bloqueado (Faltam ${daysRemaining} dias)`}
          </span>
        </div>

        <div className="text-xs text-slate-600 space-y-1">
          <p>E-mail de comprador cadastrado: <strong>{crmData.userAuth.buyerEmail}</strong></p>
          <p>Data de ativação da compra: <strong>{new Date(crmData.userAuth.purchaseDate + 'T00:00:00').toLocaleDateString('pt-BR')}</strong> ({daysPassed} dias decorridos)</p>
          {!bonusUnlocked && (
            <p className="text-amber-700 font-medium pt-1">
              * Seus módulos bônus exclusivos serão liberados automaticamente após o 7º dia da compra.
            </p>
          )}
        </div>

        {onLogout && (
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Deseja trocar de conta ou sair?</span>
            <button
              onClick={() => {
                if (confirm('Deseja desconectar a conta deste aparelho?')) {
                  onLogout();
                }
              }}
              className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition cursor-pointer"
            >
              Desconectar Conta
            </button>
          </div>
        )}
      </div>

      {/* 5. Dados de Demonstração & Limpeza */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800">
            Base de Dados e Demonstração
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Carregue exemplos reais de clientes e serviços ou limpe a memória local.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (confirm('Deseja recarregar os dados de exemplo do estúdio?')) {
                onResetToDemoData();
              }
            }}
            className="px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer shadow-2xs"
          >
            Restaurar Dados Exemplo
          </button>

          <button
            onClick={() => {
              if (confirm('ATENÇÃO: Deseja apagar todos os clientes, agendamentos e transações salvas neste aparelho? Esta ação é irreversível a menos que você tenha um backup exportado.')) {
                onClearAllData();
              }
            }}
            className="px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 text-xs font-semibold transition cursor-pointer"
          >
            Limpar Base
          </button>
        </div>
      </div>

      {/* 6. Assinatura & Créditos de Criação */}
      <div className="bg-linear-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 text-white text-center border border-slate-800 shadow-md space-y-2">
        <h4 className="text-base font-bold text-white tracking-tight">
          {BRANDING.appName}
        </h4>
        <p className="text-xs md:text-sm text-cyan-300 italic font-medium max-w-lg mx-auto">
          "{BRANDING.slogan}"
        </p>
        <div className="pt-2 text-xs text-slate-400">
          <span>Criado e Desenvolvido por </span>
          <a
            href={BRANDING.creatorUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-white hover:text-cyan-300 hover:underline transition"
          >
            {BRANDING.creatorName}
          </a>
        </div>
      </div>
    </div>
  );
};
