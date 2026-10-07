import React, { useState, useMemo } from 'react';
import {
  MessageSquareShare,
  Send,
  Copy,
  Plus,
  Trash2,
  Check,
  User,
  Sparkles,
  ExternalLink,
  Edit2,
  X,
  Tags,
} from 'lucide-react';
import { MessageTemplate, Client, ServiceItem, UserAuth } from '../../types';
import { LockedBonusBanner } from '../LockedBonusBanner';
import {
  buildWhatsAppLink,
  cleanPhoneNumber,
  formatPhoneDisplay,
  replaceTemplateVariables,
} from '../../utils/whatsapp';
import { isBonusUnlocked } from '../../utils/storage';

interface Props {
  templates: MessageTemplate[];
  clients: Client[];
  services: ServiceItem[];
  userAuth: UserAuth;
  businessName: string;
  businessOwner: string;
  onAddTemplate: (tmpl: Omit<MessageTemplate, 'id'>) => void;
  onUpdateTemplate: (tmpl: MessageTemplate) => void;
  onDeleteTemplate: (id: string) => void;
  onToggleBonusOverride: () => void;
}

export const WhatsAppTab: React.FC<Props> = ({
  templates,
  clients,
  services,
  userAuth,
  businessName,
  businessOwner,
  onAddTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  onToggleBonusOverride,
}) => {
  const isUnlocked = isBonusUnlocked(userAuth);

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    templates[0]?.id || ''
  );
  const [selectedClientId, setSelectedClientId] = useState<string>(
    clients[0]?.id || ''
  );
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    services[0]?.id || ''
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copied, setCopied] = useState(false);

  // Template Modal (Add / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [modalTitle, setModalTitle] = useState('');
  const [modalCategory, setModalCategory] = useState<MessageTemplate['category']>('Confirmação');
  const [modalText, setModalText] = useState('');

  // If locked, render the locked banner
  if (!isUnlocked) {
    return (
      <LockedBonusBanner
        moduleName="Módulo Bônus: Mensagens Rápidas para WhatsApp"
        moduleDescription="Biblioteca pronta de scripts de conversão, lembretes de retorno e felicitações com preenchimento automático em 1 clique."
        userAuth={userAuth}
        onUnlockOverrideToggle={onToggleBonusOverride}
      />
    );
  }

  const selectedTemplate =
    templates.find((t) => t.id === selectedTemplateId) || templates[0];
  const selectedClient = clients.find((c) => c.id === selectedClientId);
  const selectedService = services.find((s) => s.id === selectedServiceId);

  // Replaced real-time preview text
  const previewMessage = useMemo(() => {
    if (!selectedTemplate) return '';
    return replaceTemplateVariables(selectedTemplate.text, {
      client: selectedClient,
      service: selectedService,
      businessName,
      businessOwner,
    });
  }, [selectedTemplate, selectedClient, selectedService, businessName, businessOwner]);

  const handleSendWhatsApp = () => {
    if (!selectedClient || !selectedClient.phone) {
      alert('Selecione um cliente com telefone/WhatsApp válido.');
      return;
    }
    const url = buildWhatsAppLink(selectedClient.phone, previewMessage);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(previewMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openNewModal = () => {
    setEditingTemplate(null);
    setModalTitle('');
    setModalCategory('Confirmação');
    setModalText('');
    setIsModalOpen(true);
  };

  const openEditModal = (t: MessageTemplate) => {
    setEditingTemplate(t);
    setModalTitle(t.title);
    setModalCategory(t.category);
    setModalText(t.text);
    setIsModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalTitle.trim() || !modalText.trim()) {
      alert('Preencha o título e o texto da mensagem.');
      return;
    }

    if (editingTemplate) {
      onUpdateTemplate({
        ...editingTemplate,
        title: modalTitle.trim(),
        category: modalCategory,
        text: modalText.trim(),
      });
    } else {
      onAddTemplate({
        title: modalTitle.trim(),
        category: modalCategory,
        text: modalText.trim(),
      });
    }

    setIsModalOpen(false);
  };

  const filteredTemplates = useMemo(() => {
    if (selectedCategory === 'all') return templates;
    return templates.filter((t) => t.category === selectedCategory);
  }, [templates, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <MessageSquareShare className="w-6 h-6 text-blue-600" />
              Mensagens Rápidas WhatsApp (1 Clique)
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
              BÔNUS LIBERADO
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Envie mensagens de confirmação, lembretes de retorno e avisos personalizados com 1 clique direto no WhatsApp.
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs md:text-sm shadow-sm transition active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Novo Modelo</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Template Library */}
        <div className="lg:col-span-5 space-y-4">
          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Todos ({templates.length})
            </button>
            {['Confirmação', 'Lembrete', 'Aniversário', 'Promoção', 'Pós-Atendimento'].map(
              (cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              )
            )}
          </div>

          {/* Templates List */}
          <div className="space-y-2.5">
            {filteredTemplates.map((t) => {
              const isSelected = selectedTemplate?.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTemplateId(t.id)}
                  className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between gap-2 shadow-2xs ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 leading-tight">
                      {t.title}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {t.category}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2">
                    {t.text}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                    <span>Variáveis: {'{nome}'}, {'{servico}'}...</span>
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openEditModal(t)}
                        className="p-1 hover:text-slate-700 hover:bg-slate-100 rounded"
                        title="Editar modelo"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      {!t.isDefault && (
                        <button
                          onClick={() => {
                            if (confirm('Excluir este modelo?')) {
                              onDeleteTemplate(t.id);
                            }
                          }}
                          className="p-1 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Excluir modelo"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Message Customizer & Instant 1-Click WhatsApp Sender */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Personalizar & Enviar</span>
              {selectedTemplate && (
                <span className="text-xs font-medium text-blue-600 normal-case">
                  Modelo: {selectedTemplate.title}
                </span>
              )}
            </h2>

            {/* Select Client & Service */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  1. Selecionar Cliente *
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({formatPhoneDisplay(c.phone)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  2. Procedimento Vinculado
                </label>
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Live WhatsApp Bubble Preview */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Prévia da Mensagem (Pronta para Envio)
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  📱 WhatsApp Web / App
                </span>
              </div>

              {/* WhatsApp chat box simulator */}
              <div className="bg-[#efeae2] p-4 rounded-2xl border border-slate-300 relative shadow-inner min-h-[160px] flex flex-col justify-between">
                <div className="bg-white rounded-2xl rounded-tr-xs p-3.5 max-w-lg shadow-sm border border-slate-200/80 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed self-start">
                  {previewMessage || 'Selecione um modelo à esquerda...'}
                  <div className="text-[10px] text-slate-400 text-right mt-1.5">
                    {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} ✓✓
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-slate-600 bg-white/70 backdrop-blur-xs p-2 rounded-lg flex items-center justify-between">
                  <span>Destinatário: <strong>{selectedClient?.name || 'Cliente'}</strong></span>
                  <span>{selectedClient ? formatPhoneDisplay(selectedClient.phone) : ''}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons: 1-Click WhatsApp & Copy */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Send className="w-4 h-4" />
                <span>Enviar no WhatsApp com 1 Clique</span>
                <ExternalLink className="w-3.5 h-3.5 text-emerald-200" />
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="w-full sm:w-auto py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs md:text-sm transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-400" />
                    <span>Copiar Texto</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Add / Edit Template */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <h2 className="text-base font-bold text-slate-900">
                {editingTemplate ? 'Editar Modelo de Mensagem' : 'Novo Modelo de Mensagem'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Título do Modelo *
                </label>
                <input
                  type="text"
                  required
                  value={modalTitle}
                  onChange={(e) => setModalTitle(e.target.value)}
                  placeholder="Ex: Lembrete de Manutenção 20 Dias"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Categoria
                </label>
                <select
                  value={modalCategory}
                  onChange={(e) => setModalCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
                >
                  <option value="Confirmação">Confirmação de Horário</option>
                  <option value="Lembrete">Lembrete de Retorno</option>
                  <option value="Aniversário">Parabéns / Aniversário</option>
                  <option value="Promoção">Promoção / Oferta</option>
                  <option value="Pós-Atendimento">Cuidados Pós-Atendimento</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Texto da Mensagem *
                </label>
                <textarea
                  rows={4}
                  required
                  value={modalText}
                  onChange={(e) => setModalText(e.target.value)}
                  placeholder="Use as variáveis: {nome}, {primeiro_nome}, {servico}, {data}, {horario}, {negocio}, {profissional}"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white resize-none"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <strong>Variáveis automáticas disponíveis:</strong>
                <p>
                  <code>{'{nome}'}</code>, <code>{'{primeiro_nome}'}</code>, <code>{'{servico}'}</code>, <code>{'{data}'}</code>, <code>{'{horario}'}</code>, <code>{'{negocio}'}</code>
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-medium transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-xs transition cursor-pointer"
                >
                  Salvar Modelo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
