import { CRMData, MessageTemplate, UserAuth, LicenseUser } from '../types';

const STORAGE_KEY = 'gr_crm_autonomo_data_v3';

export const DEFAULT_REGISTERED_USERS: LicenseUser[] = [
  {
    id: 'usr-admin',
    email: 'gleicieneads@gmail.com',
    name: 'Gleiciene Rocha (Administradora)',
    accessKey: 'ADMIN_PLEASE_CHANGE_ME_IMMEDIATELY',
    role: 'admin',
    purchaseDate: '2026-01-01',
    isUnlockedOverride: true,
    createdAt: new Date().toISOString(),
    notes: 'Conta Administradora com controle total do sistema e gerenciamento de licenças.',
  },
  {
    id: 'usr-teste',
    email: 'usuarioteste@gmail.com',
    name: 'Usuário de Teste',
    accessKey: '123',
    role: 'tester',
    purchaseDate: new Date().toISOString().split('T')[0],
    isUnlockedOverride: false,
    createdAt: new Date().toISOString(),
    notes: 'Conta de teste com senha 123 para validar a regra dos 7 dias.',
  },
];

export const DEFAULT_TEMPLATES: MessageTemplate[] = [
  {
    id: 'tmpl-1',
    title: 'Confirmação de Agendamento',
    category: 'Confirmação',
    text: 'Olá {primeiro_nome}! ✨ Passando para confirmar seu horário de {servico} agendado para {data} às {horario}. Podemos confirmar sua presença? Um abraço, {profissional}!',
    isDefault: true,
  },
  {
    id: 'tmpl-2',
    title: 'Lembrete de Retorno / Manutenção',
    category: 'Lembrete',
    text: 'Oi, {primeiro_nome}! 🌸 Como estão seus cuidados? Já se passaram alguns dias desde o seu último {servico}. Está na hora de garantir o seu retorno para manter o resultado impecável! Gostaria de olhar os horários desta semana?',
    isDefault: true,
  },
  {
    id: 'tmpl-3',
    title: 'Parabéns e Presente de Aniversário',
    category: 'Aniversário',
    text: 'Parabéns pelo seu dia, {primeiro_nome}! 🎂🎈 Desejo muitas realizações, saúde e sucesso para você! Para comemorar, você ganhou 15% de desconto especial em qualquer atendimento este mês no {negocio}. Vamos agendar seu momento especial?',
    isDefault: true,
  },
  {
    id: 'tmpl-4',
    title: 'Cuidados & Orientações Pós-Atendimento',
    category: 'Pós-Atendimento',
    text: 'Olá {primeiro_nome}! Muito obrigada pela confiança hoje no seu {servico}! 💕 Caso tenha qualquer dúvida ou necessite de orientações adicionais, estou à sua total disposição por aqui!',
    isDefault: true,
  },
  {
    id: 'tmpl-5',
    title: 'Promoção / Vaga VIP de Horário',
    category: 'Promoção',
    text: 'Oi {primeiro_nome}! 🌟 Surgiu um horário especial hoje ou amanhã para {servico} com uma condição exclusiva para clientes especiais. Quer aproveitar e garantir seu horário? Me avise aqui!',
    isDefault: true,
  },
];

export function getDaysSincePurchase(purchaseDateStr: string): number {
  if (!purchaseDateStr) return 0;
  const purchase = new Date(purchaseDateStr);
  const now = new Date();
  // Difference in whole calendar days
  const diffTime = now.getTime() - purchase.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

export function isBonusUnlocked(userAuth: UserAuth): boolean {
  if (!userAuth.isLoggedIn) return false;
  if (userAuth.isUnlockedOverride) return true;
  return getDaysSincePurchase(userAuth.purchaseDate) >= 7;
}

export function getDaysRemainingForBonus(purchaseDateStr: string): number {
  const days = getDaysSincePurchase(purchaseDateStr);
  return Math.max(0, 7 - days);
}

export const INITIAL_DATA: CRMData = {
  businessName: 'Espaço & Serviços Profissionais',
  businessOwner: 'Gleiciene Rocha',
  userAuth: {
    isLoggedIn: false, // Inicia DESLOGADO para exibir a tela de login ao abrir o site!
    buyerEmail: '',
    buyerName: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    isUnlockedOverride: false,
    role: 'user',
  },
  registeredUsers: DEFAULT_REGISTERED_USERS,
  clients: [
    {
      id: 'c-1',
      name: 'Juliana Mendes',
      phone: '11987654321',
      email: 'juliana.mendes@email.com',
      birthday: '1995-10-18',
      notes: 'Cliente fiel. Prefere horários no período da tarde. Atendimento pontual.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'c-2',
      name: 'Camila Rocha',
      phone: '11991234567',
      email: 'camila.rocha@email.com',
      birthday: '1992-04-12',
      notes: 'Solicitou plano de acompanhamento mensal com pagamento via Pix.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'c-3',
      name: 'Marcos Vinicius',
      phone: '11977778888',
      email: 'marcos.v@email.com',
      birthday: '1988-10-08',
      notes: 'Contrato de prestação de serviços com emissão de recibo.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'c-4',
      name: 'Beatriz Santos',
      phone: '11988889999',
      email: 'beatriz.santos@email.com',
      birthday: '1990-12-05',
      notes: 'Atendimento recorrente quinzenal.',
      createdAt: new Date().toISOString(),
    },
  ],
  services: [
    {
      id: 's-1',
      name: 'Consultoria / Sessão de Atendimento Especializado',
      category: 'Consultoria & Atendimento',
      durationMinutes: 60,
      price: 180,
      description: 'Atendimento individualizado com diagnóstico e direcionamento personalizado.',
    },
    {
      id: 's-2',
      name: 'Sessão de Terapia / Massoterapia Integrativa',
      category: 'Saúde, Terapias & Bem-Estar',
      durationMinutes: 75,
      price: 150,
      description: 'Protocolo completo de alívio de tensões, reabilitação e equilíbrio corporal.',
    },
    {
      id: 's-3',
      name: 'Procedimento Estético / Cuidados Faciais',
      category: 'Beleza & Estética',
      durationMinutes: 60,
      price: 160,
      description: 'Higienização profunda, esfoliação e nutrição dérmica com dermocosméticos.',
    },
    {
      id: 's-4',
      name: 'Alongamento / Manutenção em Gel ou Fibra',
      category: 'Unhas / Nail Design',
      durationMinutes: 90,
      price: 130,
      description: 'Estruturação, cutilagem técnica e finalização impecável.',
    },
    {
      id: 's-5',
      name: 'Aula Particular / Treinamento Especializado',
      category: 'Aulas, Treinos & Cursos',
      durationMinutes: 60,
      price: 120,
      description: 'Treino ou aula focada em objetivos práticos individuais.',
    },
    {
      id: 's-6',
      name: 'Serviço Técnico / Reparo ou Diagnóstico',
      category: 'Reparos, Manutenção & Técnico',
      durationMinutes: 90,
      price: 220,
      description: 'Análise técnica, substituição de componentes e teste de conformidade.',
    },
  ],
  appointments: [
    {
      id: 'ap-1',
      clientId: 'c-1',
      serviceId: 's-1',
      dateTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16),
      status: 'agendado',
      notes: 'Confirmar materiais e checklist antes do início.',
      finalPrice: 180,
      paymentMethod: 'Pix',
    },
    {
      id: 'ap-2',
      clientId: 'c-3',
      serviceId: 's-2',
      dateTime: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString().slice(0, 16),
      status: 'agendado',
      notes: 'Sessão de retorno com foco em relaxamento muscular.',
      finalPrice: 150,
      paymentMethod: 'Pix',
    },
    {
      id: 'ap-3',
      clientId: 'c-2',
      serviceId: 's-3',
      dateTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      status: 'concluido',
      notes: 'Atendimento concluído com ótima avaliação da cliente.',
      finalPrice: 160,
      paymentMethod: 'Cartão Crédito',
    },
  ],
  transactions: [
    {
      id: 'tr-1',
      type: 'entrada',
      amount: 160,
      description: 'Procedimento Estético Facial - Camila Rocha',
      category: 'Atendimentos',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paymentMethod: 'Cartão Crédito',
    },
    {
      id: 'tr-2',
      type: 'entrada',
      amount: 180,
      description: 'Consultoria Especializada - Juliana Mendes',
      category: 'Atendimentos',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paymentMethod: 'Pix',
    },
    {
      id: 'tr-3',
      type: 'saida',
      amount: 85,
      description: 'Reposição de insumos e materiais de trabalho',
      category: 'Materiais & Insumos',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paymentMethod: 'Pix',
    },
    {
      id: 'tr-4',
      type: 'saida',
      amount: 45,
      description: 'Descartáveis e produtos de higienização',
      category: 'Descartáveis',
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paymentMethod: 'Dinheiro',
    },
  ],
  templates: DEFAULT_TEMPLATES,
};

export function loadCRMData(): CRMData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveCRMData(INITIAL_DATA);
      return INITIAL_DATA;
    }
    const parsed = JSON.parse(raw);
    // Ensure backwards compatibility with any missing keys
    // Ensure default users like admin and usuarioteste are always available
    const userList: LicenseUser[] = Array.isArray(parsed.registeredUsers) && parsed.registeredUsers.length > 0
      ? [...parsed.registeredUsers]
      : [...DEFAULT_REGISTERED_USERS];

    DEFAULT_REGISTERED_USERS.forEach((defUser) => {
      if (!userList.some((u) => u.email.toLowerCase() === defUser.email.toLowerCase())) {
        userList.push(defUser);
      }
    });

    return {
      businessName: parsed.businessName || INITIAL_DATA.businessName,
      businessOwner: parsed.businessOwner || INITIAL_DATA.businessOwner,
      userAuth: parsed.userAuth || INITIAL_DATA.userAuth,
      clients: Array.isArray(parsed.clients) ? parsed.clients : INITIAL_DATA.clients,
      services: Array.isArray(parsed.services) ? parsed.services : INITIAL_DATA.services,
      appointments: Array.isArray(parsed.appointments) ? parsed.appointments : INITIAL_DATA.appointments,
      transactions: Array.isArray(parsed.transactions) ? parsed.transactions : INITIAL_DATA.transactions,
      templates: Array.isArray(parsed.templates) && parsed.templates.length > 0 ? parsed.templates : DEFAULT_TEMPLATES,
      registeredUsers: userList,
      lastBackupDate: parsed.lastBackupDate,
    };
  } catch (err) {
    console.error('Error loading CRM data from LocalStorage:', err);
    return INITIAL_DATA;
  }
}

export function saveCRMData(data: CRMData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Error saving CRM data to LocalStorage:', err);
  }
}

export interface StorageStats {
  usedBytes: number;
  usedKb: number;
  capacityKb: number;
  percentage: number;
  status: 'safe' | 'warning' | 'critical';
  lastBackupFormatted: string;
  needsBackup: boolean;
  totalRecords: number;
}

export function getStorageStats(data: CRMData): StorageStats {
  let usedBytes = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k) {
        usedBytes += (k.length + (localStorage.getItem(k)?.length || 0)) * 2;
      }
    }
  } catch (e) {
    usedBytes = JSON.stringify(data).length * 2;
  }

  const usedKb = Math.max(1, Math.round(usedBytes / 1024));
  const capacityKb = 5120; // 5 MB padrão do LocalStorage no navegador
  const percentage = Math.min(100, Math.round((usedKb / capacityKb) * 100));

  let status: 'safe' | 'warning' | 'critical' = 'safe';
  if (percentage >= 80) status = 'critical';
  else if (percentage >= 50) status = 'warning';

  const totalRecords =
    (data.clients?.length || 0) +
    (data.appointments?.length || 0) +
    (data.transactions?.length || 0);

  let needsBackup = false;
  let lastBackupFormatted = 'Nenhum backup realizado ainda';

  if (data.lastBackupDate) {
    const bDate = new Date(data.lastBackupDate);
    const daysSince = Math.floor((Date.now() - bDate.getTime()) / (1000 * 60 * 60 * 24));
    lastBackupFormatted = bDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    if (daysSince >= 10 || percentage >= 50) {
      needsBackup = true;
    }
  } else if (totalRecords > 3) {
    needsBackup = true;
  }

  return {
    usedBytes,
    usedKb,
    capacityKb,
    percentage,
    status,
    lastBackupFormatted,
    needsBackup,
    totalRecords,
  };
}

export async function exportBackupFile(data: CRMData): Promise<string> {
  const updatedDate = new Date().toISOString();
  const dataToExport: CRMData = {
    ...data,
    lastBackupDate: updatedDate,
  };

  const filename = 'GR-CRM-Backup-Oficial.json';
  const jsonContent = JSON.stringify(dataToExport, null, 2);

  // Modern File System Access API (allows user to overwrite the exact same file without duplicates)
  if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: filename,
        types: [
          {
            description: 'Arquivo de Backup GR CRM (JSON)',
            accept: { 'application/json': ['.json'] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(jsonContent);
      await writable.close();
      saveCRMData(dataToExport);
      return updatedDate;
    } catch (err: any) {
      // User cancelled picker or permission denied - fallback to regular download
      if (err.name === 'AbortError') return updatedDate;
    }
  }

  // Standard download fallback
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  saveCRMData(dataToExport);
  return updatedDate;
}

export function parseAndValidateBackup(jsonString: string): { success: boolean; data?: CRMData; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, error: 'O arquivo não contém um objeto JSON válido.' };
    }
    if (!Array.isArray(parsed.clients) || !Array.isArray(parsed.services)) {
      return { success: false, error: 'Formato de backup incompatível com o GR CRM Autônomo.' };
    }
    const cleanData: CRMData = {
      businessName: parsed.businessName || 'Meu Negócio Autônomo',
      businessOwner: parsed.businessOwner || 'Profissional',
      userAuth: parsed.userAuth || {
        isLoggedIn: true,
        buyerEmail: 'usuario@email.com',
        buyerName: 'Profissional',
        purchaseDate: new Date().toISOString().split('T')[0],
      },
      clients: parsed.clients || [],
      services: parsed.services || [],
      appointments: parsed.appointments || [],
      transactions: parsed.transactions || [],
      templates: parsed.templates || DEFAULT_TEMPLATES,
    };
    return { success: true, data: cleanData };
  } catch (err) {
    return { success: false, error: 'Falha ao processar o arquivo JSON. Verifique a integridade do arquivo.' };
  }
}
