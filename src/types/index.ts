export type TabType = 
  | 'clients' 
  | 'services' 
  | 'appointments' 
  | 'finance' 
  | 'pricing' 
  | 'whatsapp' 
  | 'settings';

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  birthday?: string; // YYYY-MM-DD
  notes?: string;
  createdAt: string;
}

export type ServiceCategory = 
  | 'Consultoria & Atendimento'
  | 'Beleza & Estética'
  | 'Saúde, Terapias & Bem-Estar'
  | 'Aulas, Treinos & Cursos'
  | 'Fotografia & Eventos'
  | 'Reparos, Manutenção & Técnico'
  | 'Design & Produção'
  | 'Unhas / Nail Design'
  | 'Geral / Outros';

export interface ServiceItem {
  id: string;
  name: string;
  category: ServiceCategory;
  durationMinutes: number;
  price: number;
  description?: string;
}

export type AppointmentStatus = 'agendado' | 'concluido' | 'cancelado';

export interface Appointment {
  id: string;
  clientId: string;
  serviceId: string;
  dateTime: string; // ISO string e.g. 2026-10-06T14:30
  status: AppointmentStatus;
  notes?: string;
  finalPrice?: number;
  paymentMethod?: 'Pix' | 'Cartão Crédito' | 'Cartão Débito' | 'Dinheiro' | 'Outro';
  syncedToGoogle?: boolean;
}

export type TransactionType = 'entrada' | 'saida';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  date: string; // YYYY-MM-DD
  paymentMethod?: 'Pix' | 'Cartão Crédito' | 'Cartão Débito' | 'Dinheiro' | 'Boleto' | 'Outro';
  appointmentId?: string;
}

export interface MessageTemplate {
  id: string;
  title: string;
  category: 'Confirmação' | 'Lembrete' | 'Aniversário' | 'Promoção' | 'Pós-Atendimento';
  text: string;
  isDefault?: boolean;
}

export interface UserAuth {
  isLoggedIn: boolean;
  buyerEmail: string;
  buyerName: string;
  purchaseDate: string; // ISO date string e.g. 2026-10-01
  isUnlockedOverride?: boolean; // Admin/tester toggle to bypass 7 days
}

export interface CRMData {
  clients: Client[];
  services: ServiceItem[];
  appointments: Appointment[];
  transactions: Transaction[];
  templates: MessageTemplate[];
  userAuth: UserAuth;
  businessName: string;
  businessOwner: string;
  lastBackupDate?: string; // ISO string of last exported backup
}
