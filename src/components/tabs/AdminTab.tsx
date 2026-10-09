import React, { useState } from 'react';
import {
  ShieldAlert,
  UserCheck,
  UserPlus,
  Key,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Unlock,
  Lock,
  UserCog,
  Calendar,
  Sparkles,
  Info,
} from 'lucide-react';
import { LicenseUser, UserAuth } from '../../types';
import { getDaysRemainingForBonus, getDaysSincePurchase } from '../../utils/storage';

interface Props {
  registeredUsers: LicenseUser[];
  currentUserAuth: UserAuth;
  onAddUser: (user: Omit<LicenseUser, 'id' | 'createdAt'>) => void;
  onDeleteUser: (userId: string) => void;
  onToggleUserUnlock: (userId: string) => void;
  onSwitchUser: (user: LicenseUser) => void;
  onUpdateAdminPassword?: (newPassword: string) => void;
}

export const AdminTab: React.FC<Props> = ({
  registeredUsers,
  currentUserAuth,
  onAddUser,
  onDeleteUser,
  onToggleUserUnlock,
  onSwitchUser,
  onUpdateAdminPassword,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [accessKey, setAccessKey] = useState('');
  const [role, setRole] = useState<'user' | 'tester'>('tester');
  const [accessType, setAccessType] = useState<'locked7days' | 'fullUnlocked'>('locked7days');
  const [notes, setNotes] = useState('');

  const handleOpenModal = () => {
    setName('');
    setEmail('');
    setAccessKey('');
    setRole('tester');
    setAccessType('locked7days');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !accessKey.trim()) {
      alert('Por favor, informe ao menos o e-mail e a senha/chave de acesso.');
      return;
    }

    const purchaseDate =
      accessType === 'fullUnlocked'
        ? new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

    onAddUser({
      name: name.trim() || 'Usuário de Teste',
      email: email.trim().toLowerCase(),
      accessKey: accessKey.trim(),
      role,
      purchaseDate,
      isUnlockedOverride: accessType === 'fullUnlocked',
      notes: notes.trim() || undefined,
    });

    setIsModalOpen(false);
  };

  const handleCopyMagicLink = (user: LicenseUser) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://grpresencadigital.site';
    const path = typeof window !== 'undefined' ? window.location.pathname : '/crm/';
    const link = `${origin}${path}?email=${encodeURIComponent(user.email)}&chave=${encodeURIComponent(user.accessKey)}`;

    navigator.clipboard.writeText(link);
    setCopiedId(user.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 rounded-3xl border border-blue-900 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-blue-600/40 flex items-center justify-center text-cyan-400 border border-blue-500/40">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              Painel de Administradora & Gestão de Acessos
            </h1>
          </div>
          <p className="text-xs text-slate-300">
            Você está conectada como <strong>{currentUserAuth.buyerEmail}</strong> (Controle Master).
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Cadastrar Usuário / Teste</span>
        </button>
      </div>

      {/* Info card */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs text-blue-950 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-blue-900">
            Como funciona a liberação de contas para clientes e testadores:
          </p>
          <p className="text-blue-800 leading-relaxed">
            Cadastre os e-mails e senhas de quem vai testar (ex: <code>usuarioteste@gmail.com</code> com senha <code>123</code>). Você pode copiar o <strong>Link de Acesso Direto</strong> com 1 clique para mandar pelo WhatsApp ou instruir o usuário a digitar essas credenciais na tela de login.
          </p>
        </div>
      </div>

      {/* Alterar Senha da Administradora */}
      <div className="bg-white rounded-2xl border border-purple-200 p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Key className="w-4 h-4 text-purple-600" />
              <span>Sua Senha de Administradora (Segurança Master)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Você pode alterar a sua senha master pessoal a qualquer momento. Ela ficará salva com segurança apenas no seu aparelho.
            </p>
          </div>
          {passwordSuccess && (
            <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-semibold animate-in fade-in">
              ✓ Senha atualizada com sucesso!
            </span>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!newAdminPassword.trim() || newAdminPassword.trim().length < 3) {
              alert('Por favor, informe uma senha com no mínimo 3 caracteres.');
              return;
            }
            if (onUpdateAdminPassword) {
              onUpdateAdminPassword(newAdminPassword.trim());
              setPasswordSuccess(true);
              setNewAdminPassword('');
              setTimeout(() => setPasswordSuccess(false), 4000);
            }
          }}
          className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
        >
          <div className="flex-1">
            <input
              type="text"
              value={newAdminPassword}
              onChange={(e) => setNewAdminPassword(e.target.value)}
              placeholder="Digite sua nova senha de administradora (ex: Gleiciene@2026)"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-600 focus:bg-white font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs shadow-xs transition cursor-pointer shrink-0"
          >
            Salvar Minha Nova Senha
          </button>
        </form>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCog className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-sm text-slate-900">
              Contas e Licenças Cadastradas ({registeredUsers.length})
            </h2>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {registeredUsers.map((user) => {
            const isSelf = user.email.toLowerCase() === currentUserAuth.buyerEmail.toLowerCase();
            const daysPassed = getDaysSincePurchase(user.purchaseDate);
            const daysRemaining = getDaysRemainingForBonus(user.purchaseDate);
            const isBonusUnlocked = user.isUnlockedOverride || daysPassed >= 7;

            return (
              <div
                key={user.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 text-sm md:text-base">
                      {user.name}
                    </span>

                    {user.role === 'admin' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                        👑 Administrador Master
                      </span>
                    ) : user.role === 'tester' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        🧪 Usuário de Teste
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                        👤 Cliente Comprador
                      </span>
                    )}

                    {isBonusUnlocked ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <Unlock className="w-3 h-3 text-emerald-600" />
                        Bônus 100% Liberados
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-amber-600" />
                        Trava de 7 dias ativa ({daysRemaining}d restantes)
                      </span>
                    )}

                    {isSelf && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-white">
                        Você está logado nesta conta
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-600 flex-wrap pt-0.5">
                    <span>
                      E-mail: <strong className="text-slate-900">{user.email}</strong>
                    </span>
                    <span>
                      Senha / Chave: <strong className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md font-mono">{user.accessKey}</strong>
                    </span>
                    <span>
                      Compra: <strong>{new Date(user.purchaseDate + 'T00:00:00').toLocaleDateString('pt-BR')}</strong> ({daysPassed} dias)
                    </span>
                  </div>

                  {user.notes && (
                    <p className="text-[11px] text-slate-500 italic mt-0.5">
                      Obs: {user.notes}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  {/* Copy magic link */}
                  <button
                    onClick={() => handleCopyMagicLink(user)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition cursor-pointer"
                    title="Copiar link direto para este usuário acessar sem precisar digitar senha"
                  >
                    {copiedId === user.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Link Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copiar Link de Acesso</span>
                      </>
                    )}
                  </button>

                  {/* Toggle unlock */}
                  {user.role !== 'admin' && (
                    <button
                      onClick={() => onToggleUserUnlock(user.id)}
                      className={`p-2 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                        user.isUnlockedOverride
                          ? 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                      }`}
                      title={user.isUnlockedOverride ? 'Ativar regra de 7 dias para este usuário' : 'Liberar bônus imediatamente para este usuário'}
                    >
                      {user.isUnlockedOverride ? (
                        <Lock className="w-3.5 h-3.5" />
                      ) : (
                        <Unlock className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}

                  {/* Switch user */}
                  {!isSelf && (
                    <button
                      onClick={() => {
                        if (confirm(`Deseja entrar no CRM simulando exatamente a visão de "${user.name}" (${user.email})?`)) {
                          onSwitchUser(user);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-semibold transition cursor-pointer"
                      title="Ver como este usuário visualiza o CRM"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Testar Acesso</span>
                    </button>
                  )}

                  {/* Delete user */}
                  {user.role !== 'admin' && (
                    <button
                      onClick={() => {
                        if (confirm(`Tem certeza que deseja remover o usuário ${user.email}?`)) {
                          onDeleteUser(user.id);
                        }
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                      title="Excluir usuário"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Add User */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                Cadastrar Usuário / Licença de Teste
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  E-mail de Acesso *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ex: usuarioteste@gmail.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Senha / Chave *
                  </label>
                  <input
                    type="text"
                    required
                    value={accessKey}
                    onChange={(e) => setAccessKey(e.target.value)}
                    placeholder="ex: 123"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Nome do Usuário
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ex: Carlos Silva"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Modo de Liberação dos Bônus
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAccessType('locked7days')}
                    className={`p-3 rounded-xl border text-xs font-semibold text-left transition cursor-pointer ${
                      accessType === 'locked7days'
                        ? 'border-amber-400 bg-amber-50 text-amber-900 ring-2 ring-amber-400/30'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1 font-bold mb-0.5">
                      <Lock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Trava 7 Dias</span>
                    </div>
                    <span className="text-[11px] text-slate-500 block">
                      Bônus bloqueados para testar a carência.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAccessType('fullUnlocked')}
                    className={`p-3 rounded-xl border text-xs font-semibold text-left transition cursor-pointer ${
                      accessType === 'fullUnlocked'
                        ? 'border-emerald-400 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-400/30'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1 font-bold mb-0.5">
                      <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>100% Liberado</span>
                    </div>
                    <span className="text-[11px] text-slate-500 block">
                      Acesso total imediato aos 3 bônus.
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Observações (Opcional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ex: Testador convidado pelo WhatsApp"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Salvar e Criar Acesso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
