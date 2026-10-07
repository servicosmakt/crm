import React, { useState, useEffect } from 'react';
import {
  loadCRMData,
  saveCRMData,
  INITIAL_DATA,
  isBonusUnlocked,
  getStorageStats,
  exportBackupFile,
} from './utils/storage';
import {
  CRMData,
  TabType,
  Client,
  ServiceItem,
  Appointment,
  Transaction,
  MessageTemplate,
  UserAuth,
} from './types';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LoginModal } from './components/LoginModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { BackupReminderBanner } from './components/BackupReminderBanner';

// Tabs
import { ClientsTab } from './components/tabs/ClientsTab';
import { ServicesTab } from './components/tabs/ServicesTab';
import { AppointmentsTab } from './components/tabs/AppointmentsTab';
import { FinanceTab } from './components/tabs/FinanceTab';
import { PricingCalculatorTab } from './components/tabs/PricingCalculatorTab';
import { WhatsAppTab } from './components/tabs/WhatsAppTab';
import { SettingsTab } from './components/tabs/SettingsTab';

export default function App() {
  const [data, setData] = useState<CRMData>(() => loadCRMData());
  const [currentTab, setCurrentTab] = useState<TabType>('clients');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [scheduleClientId, setScheduleClientId] = useState<string | undefined>(undefined);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Check URL query parameters for auto-login / magic activation link
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const emailParam = params.get('email') || params.get('comprador');
        const nameParam = params.get('nome') || params.get('name');
        const dateParam = params.get('data') || params.get('date');
        const unlockParam = params.get('desbloquear') || params.get('unlock');

        if (emailParam) {
          setData((prev) => ({
            ...prev,
            userAuth: {
              isLoggedIn: true,
              buyerEmail: emailParam,
              buyerName: nameParam || prev.userAuth.buyerName || 'Profissional',
              purchaseDate: dateParam || new Date().toISOString().split('T')[0],
              isUnlockedOverride: unlockParam === '1' || unlockParam === 'true',
            },
            businessOwner: nameParam || prev.businessOwner,
          }));
          showToast(`Acesso ativado com sucesso para ${emailParam}!`);
          // Clean URL params without reload
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    } catch (e) {
      console.error('Error parsing URL parameters:', e);
    }
  }, []);

  // Auto-save whenever data changes
  useEffect(() => {
    saveCRMData(data);
  }, [data]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Auth & 7-Day rule Handlers
  const handleLogin = (updatedAuth: UserAuth) => {
    setData((prev) => ({
      ...prev,
      userAuth: updatedAuth,
      businessOwner: updatedAuth.buyerName || prev.businessOwner,
    }));
    setIsLoginModalOpen(false);
    showToast('Acesso atualizado com sucesso!');
  };

  const handleLogout = () => {
    setData((prev) => ({
      ...prev,
      userAuth: {
        ...prev.userAuth,
        isLoggedIn: false,
      },
    }));
    setIsLoginModalOpen(false);
    showToast('Você foi desconectado.');
  };

  const handleToggleBonusOverride = () => {
    setData((prev) => {
      const nextOverride = !prev.userAuth.isUnlockedOverride;
      showToast(
        nextOverride
          ? '🎉 Modo Teste: Módulos bônus liberados para exploração!'
          : '🔒 Trava dos 7 dias reativada.'
      );
      return {
        ...prev,
        userAuth: {
          ...prev.userAuth,
          isUnlockedOverride: nextOverride,
        },
      };
    });
  };

  // Client Handlers
  const handleAddClient = (client: Omit<Client, 'id' | 'createdAt'>) => {
    const newClient: Client = {
      ...client,
      id: `c-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setData((prev) => ({
      ...prev,
      clients: [newClient, ...prev.clients],
    }));
    showToast(`Cliente ${client.name} cadastrado com sucesso!`);
  };

  const handleUpdateClient = (updated: Client) => {
    setData((prev) => ({
      ...prev,
      clients: prev.clients.map((c) => (c.id === updated.id ? updated : c)),
    }));
    showToast('Cadastro do cliente atualizado!');
  };

  const handleDeleteClient = (id: string) => {
    setData((prev) => ({
      ...prev,
      clients: prev.clients.filter((c) => c.id !== id),
    }));
    showToast('Cliente removido.');
  };

  const handleScheduleForClient = (clientId: string) => {
    setScheduleClientId(clientId);
    setCurrentTab('appointments');
  };

  // Services Handlers
  const handleAddService = (service: Omit<ServiceItem, 'id'>) => {
    const newService: ServiceItem = {
      ...service,
      id: `s-${Date.now()}`,
    };
    setData((prev) => ({
      ...prev,
      services: [...prev.services, newService],
    }));
    showToast(`Serviço "${service.name}" adicionado ao catálogo!`);
  };

  const handleUpdateService = (updated: ServiceItem) => {
    setData((prev) => ({
      ...prev,
      services: prev.services.map((s) => (s.id === updated.id ? updated : s)),
    }));
    showToast('Serviço atualizado!');
  };

  const handleDeleteService = (id: string) => {
    setData((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s.id !== id),
    }));
    showToast('Serviço removido.');
  };

  // Appointments Handlers
  const handleAddAppointment = (appointment: Omit<Appointment, 'id'>) => {
    const newApp: Appointment = {
      ...appointment,
      id: `ap-${Date.now()}`,
    };
    setData((prev) => ({
      ...prev,
      appointments: [newApp, ...prev.appointments],
    }));
    setScheduleClientId(undefined);
    showToast('Atendimento agendado! Use o botão "Google Agenda" para sincronizar.');
  };

  const handleUpdateAppointment = (updated: Appointment) => {
    setData((prev) => ({
      ...prev,
      appointments: prev.appointments.map((a) => (a.id === updated.id ? updated : a)),
    }));
    showToast('Agendamento atualizado!');
  };

  const handleDeleteAppointment = (id: string) => {
    setData((prev) => ({
      ...prev,
      appointments: prev.appointments.filter((a) => a.id !== id),
    }));
    showToast('Agendamento removido.');
  };

  // Complete appointment and auto-register income in finance
  const handleCompleteAppointmentAndRegisterFinance = (
    appointment: Appointment,
    client?: Client,
    service?: ServiceItem
  ) => {
    const amount = appointment.finalPrice || service?.price || 0;
    const clientName = client?.name || 'Cliente';
    const serviceName = service?.name || 'Atendimento';

    const newTransaction: Transaction = {
      id: `tr-${Date.now()}`,
      type: 'entrada',
      amount,
      description: `${serviceName} - ${clientName}`,
      category: 'Atendimentos',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: appointment.paymentMethod || 'Pix',
      appointmentId: appointment.id,
    };

    setData((prev) => ({
      ...prev,
      appointments: prev.appointments.map((a) =>
        a.id === appointment.id ? { ...a, status: 'concluido' } : a
      ),
      transactions: [newTransaction, ...prev.transactions],
    }));

    showToast(`✓ Atendimento concluído e R$ ${amount.toFixed(2)} registrado no Financeiro!`);
  };

  // Finance Handlers
  const handleAddTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTr: Transaction = {
      ...transaction,
      id: `tr-${Date.now()}`,
    };
    setData((prev) => ({
      ...prev,
      transactions: [newTr, ...prev.transactions],
    }));
    showToast(
      transaction.type === 'entrada'
        ? 'Entrada registrada com sucesso!'
        : 'Despesa registrada no controle financeiro.'
    );
  };

  const handleDeleteTransaction = (id: string) => {
    setData((prev) => ({
      ...prev,
      transactions: prev.transactions.filter((t) => t.id !== id),
    }));
    showToast('Lançamento financeiro removido.');
  };

  // WhatsApp Templates Handlers
  const handleAddTemplate = (tmpl: Omit<MessageTemplate, 'id'>) => {
    const newTmpl: MessageTemplate = {
      ...tmpl,
      id: `tmpl-${Date.now()}`,
    };
    setData((prev) => ({
      ...prev,
      templates: [...prev.templates, newTmpl],
    }));
    showToast('Novo modelo de mensagem adicionado à biblioteca!');
  };

  const handleUpdateTemplate = (updated: MessageTemplate) => {
    setData((prev) => ({
      ...prev,
      templates: prev.templates.map((t) => (t.id === updated.id ? updated : t)),
    }));
    showToast('Modelo de mensagem atualizado!');
  };

  const handleDeleteTemplate = (id: string) => {
    setData((prev) => ({
      ...prev,
      templates: prev.templates.filter((t) => t.id !== id),
    }));
    showToast('Modelo de mensagem removido.');
  };

  // Settings Handlers
  const handleUpdateBusinessInfo = (name: string, owner: string) => {
    setData((prev) => ({
      ...prev,
      businessName: name,
      businessOwner: owner,
    }));
  };

  const handleUpdateUserAuth = (auth: UserAuth) => {
    setData((prev) => ({
      ...prev,
      userAuth: auth,
    }));
  };

  const handleRestoreData = (restored: CRMData) => {
    setData(restored);
    showToast('Backup restaurado com sucesso!');
  };

  const handleResetToDemoData = () => {
    setData(INITIAL_DATA);
    showToast('Dados de demonstração restaurados.');
  };

  const handleClearAllData = () => {
    const emptyData: CRMData = {
      businessName: 'Meu Negócio Autônomo',
      businessOwner: 'Profissional',
      userAuth: {
        isLoggedIn: true,
        buyerEmail: data.userAuth.buyerEmail,
        buyerName: 'Profissional',
        purchaseDate: new Date().toISOString().split('T')[0],
      },
      clients: [],
      services: [],
      appointments: [],
      transactions: [],
      templates: data.templates,
    };
    setData(emptyData);
    showToast('Base de dados zerada.');
  };

  const bonusUnlocked = isBonusUnlocked(data.userAuth);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Top Navbar */}
      <Navbar
        userAuth={data.userAuth}
        businessName={data.businessName}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onSelectTab={setCurrentTab}
        currentTab={currentTab}
        onToggleBonusOverride={handleToggleBonusOverride}
      />

      {/* Main Layout: Sidebar + Active Tab */}
      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setScheduleClientId(undefined);
            setCurrentTab(tab);
          }}
          userAuth={data.userAuth}
          clientCount={data.clients.length}
          appointmentCount={data.appointments.filter((a) => a.status === 'agendado').length}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {/* Smart Storage & Backup Reminder Banner */}
          <BackupReminderBanner
            stats={getStorageStats(data)}
            onExportBackup={async () => {
              const updatedDate = await exportBackupFile(data);
              setData((prev) => ({ ...prev, lastBackupDate: updatedDate }));
              showToast('✓ Arquivo oficial de backup atualizado com sucesso!');
            }}
          />

          {currentTab === 'clients' && (
            <ClientsTab
              clients={data.clients}
              onAddClient={handleAddClient}
              onUpdateClient={handleUpdateClient}
              onDeleteClient={handleDeleteClient}
              onScheduleForClient={handleScheduleForClient}
            />
          )}

          {currentTab === 'services' && (
            <ServicesTab
              services={data.services}
              onAddService={handleAddService}
              onUpdateService={handleUpdateService}
              onDeleteService={handleDeleteService}
              onOpenPricingCalculator={() => setCurrentTab('pricing')}
            />
          )}

          {currentTab === 'appointments' && (
            <AppointmentsTab
              appointments={data.appointments}
              clients={data.clients}
              services={data.services}
              businessName={data.businessName}
              businessOwner={data.businessOwner}
              onAddAppointment={handleAddAppointment}
              onUpdateAppointment={handleUpdateAppointment}
              onDeleteAppointment={handleDeleteAppointment}
              onCompleteAppointmentAndRegisterFinance={
                handleCompleteAppointmentAndRegisterFinance
              }
              initialSelectedClientId={scheduleClientId}
            />
          )}

          {currentTab === 'finance' && (
            <FinanceTab
              transactions={data.transactions}
              userAuth={data.userAuth}
              onAddTransaction={handleAddTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              onToggleBonusOverride={handleToggleBonusOverride}
            />
          )}

          {currentTab === 'pricing' && (
            <PricingCalculatorTab
              userAuth={data.userAuth}
              onSaveService={(newService) => {
                handleAddService(newService);
              }}
              onToggleBonusOverride={handleToggleBonusOverride}
            />
          )}

          {currentTab === 'whatsapp' && (
            <WhatsAppTab
              templates={data.templates}
              clients={data.clients}
              services={data.services}
              userAuth={data.userAuth}
              businessName={data.businessName}
              businessOwner={data.businessOwner}
              onAddTemplate={handleAddTemplate}
              onUpdateTemplate={handleUpdateTemplate}
              onDeleteTemplate={handleDeleteTemplate}
              onToggleBonusOverride={handleToggleBonusOverride}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsTab
              crmData={data}
              onUpdateBusinessInfo={handleUpdateBusinessInfo}
              onUpdateUserAuth={handleUpdateUserAuth}
              onRestoreData={handleRestoreData}
              onResetToDemoData={handleResetToDemoData}
              onClearAllData={handleClearAllData}
              onLogout={handleLogout}
            />
          )}
        </main>
      </div>

      {/* Floating Offline Status Indicator */}
      <OfflineIndicator />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom duration-200 flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Login Gate Screen (if logged out) */}
      {!data.userAuth.isLoggedIn ? (
        <LoginModal
          userAuth={data.userAuth}
          onLogin={handleLogin}
          isInitialScreen={true}
        />
      ) : isLoginModalOpen ? (
        <LoginModal
          userAuth={data.userAuth}
          onLogin={handleLogin}
          onLogout={handleLogout}
          onClose={() => setIsLoginModalOpen(false)}
        />
      ) : null}
    </div>
  );
}
