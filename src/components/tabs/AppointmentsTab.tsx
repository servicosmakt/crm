import React, { useState, useMemo } from 'react';
import {
  CalendarCheck,
  CalendarPlus,
  Calendar,
  Clock,
  User,
  Tags,
  CheckCircle2,
  XCircle,
  ExternalLink,
  MessageCircle,
  DollarSign,
  Plus,
  Search,
  Filter,
  Check,
  X,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { Appointment, Client, ServiceItem, AppointmentStatus } from '../../types';
import { buildGoogleCalendarUrl } from '../../utils/googleCalendar';
import { buildWhatsAppLink, replaceTemplateVariables, formatPhoneDisplay } from '../../utils/whatsapp';

interface Props {
  appointments: Appointment[];
  clients: Client[];
  services: ServiceItem[];
  businessName: string;
  businessOwner: string;
  onAddAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  onUpdateAppointment: (appointment: Appointment) => void;
  onDeleteAppointment: (id: string) => void;
  onCompleteAppointmentAndRegisterFinance?: (appointment: Appointment, client?: Client, service?: ServiceItem) => void;
  initialSelectedClientId?: string;
}

export const AppointmentsTab: React.FC<Props> = ({
  appointments,
  clients,
  services,
  businessName,
  businessOwner,
  onAddAppointment,
  onUpdateAppointment,
  onDeleteAppointment,
  onCompleteAppointmentAndRegisterFinance,
  initialSelectedClientId,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDateRange, setFilterDateRange] = useState<'today' | 'week' | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(!!initialSelectedClientId);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  // Form State
  const [clientId, setClientId] = useState(initialSelectedClientId || (clients[0]?.id || ''));
  const [serviceId, setServiceId] = useState(services[0]?.id || '');
  // Default to today at 14:00
  const defaultDateTime = () => {
    const d = new Date();
    d.setHours(14, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  };
  const [dateTime, setDateTime] = useState<string>(defaultDateTime());
  const [notes, setNotes] = useState('');
  const [customPrice, setCustomPrice] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'Pix' | 'Cartão Crédito' | 'Cartão Débito' | 'Dinheiro' | 'Outro'>('Pix');

  const openNewModal = (preselectedClient?: string) => {
    setEditingAppointment(null);
    setClientId(preselectedClient || clients[0]?.id || '');
    setServiceId(services[0]?.id || '');
    setDateTime(defaultDateTime());
    setNotes('');
    setCustomPrice('');
    setPaymentMethod('Pix');
    setIsModalOpen(true);
  };

  const openEditModal = (app: Appointment) => {
    setEditingAppointment(app);
    setClientId(app.clientId);
    setServiceId(app.serviceId);
    setDateTime(app.dateTime);
    setNotes(app.notes || '');
    setCustomPrice(app.finalPrice ? String(app.finalPrice) : '');
    setPaymentMethod(app.paymentMethod || 'Pix');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAppointment(null);
  };

  const selectedService = services.find((s) => s.id === serviceId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      alert('Selecione um cliente cadastrado.');
      return;
    }
    if (!serviceId) {
      alert('Selecione um serviço cadastrado.');
      return;
    }
    if (!dateTime) {
      alert('Informe a data e horário do atendimento.');
      return;
    }

    const priceNum = customPrice ? Number(customPrice) : selectedService?.price || 0;

    if (editingAppointment) {
      onUpdateAppointment({
        ...editingAppointment,
        clientId,
        serviceId,
        dateTime,
        notes: notes.trim() || undefined,
        finalPrice: priceNum,
        paymentMethod,
      });
    } else {
      onAddAppointment({
        clientId,
        serviceId,
        dateTime,
        status: 'agendado',
        notes: notes.trim() || undefined,
        finalPrice: priceNum,
        paymentMethod,
      });
    }

    closeModal();
  };

  // Google Calendar handler
  const handleOpenGoogleCalendar = (app: Appointment) => {
    const client = clients.find((c) => c.id === app.clientId);
    const service = services.find((s) => s.id === app.serviceId);
    const url = buildGoogleCalendarUrl(app, client, service, businessName);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // WhatsApp confirmation message handler
  const handleSendWhatsAppConfirmation = (app: Appointment) => {
    const client = clients.find((c) => c.id === app.clientId);
    if (!client || !client.phone) {
      alert('Cliente sem telefone cadastrado.');
      return;
    }
    const service = services.find((s) => s.id === app.serviceId);
    const template = 'Olá {primeiro_nome}! ✨ Confirmando seu atendimento de {servico} para {data} às {horario} no {negocio}. Posso confirmar? Um abraço, {profissional}!';
    const msg = replaceTemplateVariables(template, {
      client,
      service,
      appointment: app,
      businessName,
      businessOwner,
    });
    const url = buildWhatsAppLink(client.phone, msg);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Filter appointments
  const filteredAppointments = useMemo(() => {
    return appointments
      .filter((app) => {
        const client = clients.find((c) => c.id === app.clientId);
        const service = services.find((s) => s.id === app.serviceId);

        // Search term
        if (searchTerm) {
          const matchClient = client?.name.toLowerCase().includes(searchTerm.toLowerCase());
          const matchService = service?.name.toLowerCase().includes(searchTerm.toLowerCase());
          if (!matchClient && !matchService) return false;
        }

        // Status filter
        if (filterStatus !== 'all' && app.status !== filterStatus) {
          return false;
        }

        // Date range filter
        if (filterDateRange !== 'all') {
          const appDate = new Date(app.dateTime);
          const now = new Date();
          if (filterDateRange === 'today') {
            const isToday =
              appDate.getDate() === now.getDate() &&
              appDate.getMonth() === now.getMonth() &&
              appDate.getFullYear() === now.getFullYear();
            if (!isToday) return false;
          } else if (filterDateRange === 'week') {
            const diffTime = appDate.getTime() - now.getTime();
            const diffDays = diffTime / (1000 * 3600 * 24);
            // From today to 7 days ahead
            if (diffDays < -1 || diffDays > 7) return false;
          }
        }

        return true;
      })
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
  }, [appointments, clients, services, searchTerm, filterStatus, filterDateRange]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-blue-600" />
            Agenda Inteligente & Google Agenda
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Organize seus horários e sincronize direto com o <strong>Google Agenda em 1 clique</strong> com alertas no celular.
          </p>
        </div>

        <button
          onClick={() => openNewModal()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs md:text-sm shadow-sm transition active:scale-95 cursor-pointer"
        >
          <CalendarPlus className="w-4 h-4" />
          <span>Novo Agendamento</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente ou serviço..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 shadow-2xs"
          />
        </div>

        {/* Date Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFilterDateRange('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              filterDateRange === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Todos os Dias
          </button>
          <button
            onClick={() => setFilterDateRange('today')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              filterDateRange === 'today'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Hoje
          </button>
          <button
            onClick={() => setFilterDateRange('week')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              filterDateRange === 'week'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Próximos 7 Dias
          </button>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilterStatus('agendado')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
              filterStatus === 'agendado'
                ? 'bg-amber-50 text-amber-800 font-bold border border-amber-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Agendados
          </button>
          <button
            onClick={() => setFilterStatus('concluido')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
              filterStatus === 'concluido'
                ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Concluídos
          </button>
        </div>
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">Nenhum compromisso encontrado</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm || filterStatus !== 'all' || filterDateRange !== 'all'
              ? 'Tente remover os filtros para visualizar outros agendamentos.'
              : 'Clique em Novo Agendamento para marcar um horário e sincronizar com o Google Agenda.'}
          </p>
          <button
            onClick={() => openNewModal()}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
          >
            <CalendarPlus className="w-4 h-4" />
            <span>Criar Agendamento</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAppointments.map((app) => {
            const client = clients.find((c) => c.id === app.clientId);
            const service = services.find((s) => s.id === app.serviceId);
            const dateObj = new Date(app.dateTime);
            const isToday =
              dateObj.toDateString() === new Date().toDateString();

            const dateStr = dateObj.toLocaleDateString('pt-BR', {
              weekday: 'short',
              day: '2-digit',
              month: 'short',
            });
            const timeStr = dateObj.toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            });

            const price = app.finalPrice ?? service?.price ?? 0;

            return (
              <div
                key={app.id}
                className={`bg-white rounded-2xl border transition p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs hover:shadow-xs ${
                  app.status === 'concluido'
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : app.status === 'cancelado'
                    ? 'border-red-200 bg-red-50/20 opacity-70'
                    : 'border-slate-200'
                }`}
              >
                {/* Left Date / Client Info */}
                <div className="flex items-start gap-4">
                  {/* Date badge */}
                  <div
                    className={`w-16 h-16 shrink-0 rounded-2xl flex flex-col items-center justify-center text-center p-1 border ${
                      isToday
                        ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                        : 'bg-slate-50 text-slate-800 border-slate-200'
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      {dateStr.split(' ')[0]}
                    </span>
                    <span className="text-lg font-black leading-tight">
                      {dateObj.getDate()}
                    </span>
                    <span className="text-[10px] font-medium opacity-80">
                      {timeStr}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-900 text-sm md:text-base">
                        {service?.name || 'Serviço Personalizado'}
                      </h3>
                      {app.status === 'agendado' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          Agendado
                        </span>
                      )}
                      {app.status === 'concluido' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          ✓ Concluído
                        </span>
                      )}
                      {app.status === 'cancelado' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                          Cancelado
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                      <span className="flex items-center gap-1 font-semibold text-slate-800">
                        <User className="w-3.5 h-3.5 text-blue-600" />
                        {client?.name || 'Cliente'}
                      </span>
                      {client?.phone && (
                        <span className="text-slate-400">
                          {formatPhoneDisplay(client.phone)}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-md">
                        {price.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </span>
                      {app.paymentMethod && (
                        <span className="text-[11px] text-slate-500">
                          ({app.paymentMethod})
                        </span>
                      )}
                    </div>

                    {app.notes && (
                      <p className="text-xs text-slate-500 italic mt-0.5 line-clamp-1">
                        Obs: {app.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Action buttons */}
                <div className="flex items-center gap-2 flex-wrap pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 justify-end">
                  {/* Google Calendar 1-Click Button */}
                  <button
                    onClick={() => handleOpenGoogleCalendar(app)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-blue-900 text-white font-semibold text-xs shadow-xs transition active:scale-95 cursor-pointer"
                    title="Adicionar ao Google Agenda com lembretes automáticos em 1 clique"
                  >
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Google Agenda</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </button>

                  {/* WhatsApp Confirmation Button */}
                  {client?.phone && (
                    <button
                      onClick={() => handleSendWhatsAppConfirmation(app)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition active:scale-95 cursor-pointer"
                      title="Enviar confirmação pelo WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </button>
                  )}

                  {/* Concluir / Alternar Status */}
                  {app.status === 'agendado' && (
                    <button
                      onClick={() => {
                        if (onCompleteAppointmentAndRegisterFinance) {
                          onCompleteAppointmentAndRegisterFinance(app, client, service);
                        } else {
                          onUpdateAppointment({ ...app, status: 'concluido' });
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs transition cursor-pointer"
                      title="Marcar como Concluído e registrar no Financeiro"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Concluir</span>
                    </button>
                  )}

                  {/* More actions: Edit / Delete */}
                  <button
                    onClick={() => openEditModal(app)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                    title="Editar agendamento"
                  >
                    <Clock className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm('Deseja excluir este agendamento?')) {
                        onDeleteAppointment(app.id);
                      }
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                    title="Excluir agendamento"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Add / Edit Appointment */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CalendarPlus className="w-5 h-5 text-blue-600" />
                {editingAppointment ? 'Editar Agendamento' : 'Novo Agendamento Inteligente'}
              </h2>
              <button
                onClick={closeModal}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Cliente *
                </label>
                <select
                  required
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
                >
                  <option value="" disabled>
                    Selecione uma cliente...
                  </option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({formatPhoneDisplay(c.phone)})
                    </option>
                  ))}
                </select>
                {clients.length === 0 && (
                  <p className="text-[11px] text-amber-600 mt-1">
                    * Nenhum cliente cadastrado. Cadastre um cliente primeiro na aba "Clientes".
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Procedimento / Serviço *
                </label>
                <select
                  required
                  value={serviceId}
                  onChange={(e) => {
                    setServiceId(e.target.value);
                    const s = services.find((item) => item.id === e.target.value);
                    if (s) setCustomPrice(String(s.price));
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
                >
                  <option value="" disabled>
                    Selecione um serviço...
                  </option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} - {s.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} ({s.durationMinutes} min)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Data e Horário *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Valor Cobrado (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={customPrice || (selectedService ? selectedService.price : '')}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    placeholder="Valor do serviço"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white font-semibold text-blue-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Forma de Pagamento
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  >
                    <option value="Pix">Pix</option>
                    <option value="Cartão Crédito">Cartão de Crédito</option>
                    <option value="Cartão Débito">Cartão de Débito</option>
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                {editingAppointment && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Status
                    </label>
                    <select
                      value={editingAppointment.status}
                      onChange={(e) =>
                        setEditingAppointment({
                          ...editingAppointment,
                          status: e.target.value as AppointmentStatus,
                        })
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
                    >
                      <option value="agendado">Agendado</option>
                      <option value="concluido">Concluído</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Observações do Atendimento
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Observações, preferências ou detalhes do atendimento..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-medium transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={clients.length === 0 || services.length === 0}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-xs transition disabled:opacity-50 cursor-pointer"
                >
                  {editingAppointment ? 'Salvar Agendamento' : 'Confirmar Agendamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
