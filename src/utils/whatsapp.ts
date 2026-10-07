import { Client, ServiceItem, Appointment } from '../types';

export function cleanPhoneNumber(phone: string): string {
  // Remove all non-digits
  let digits = phone.replace(/\D/g, '');
  // If Brazilian format without country code (10 or 11 digits), prepend 55
  if (digits.length === 10 || digits.length === 11) {
    digits = `55${digits}`;
  }
  return digits;
}

export function formatPhoneDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

export function replaceTemplateVariables(
  templateText: string,
  options: {
    client?: Client;
    service?: ServiceItem;
    appointment?: Appointment;
    businessName?: string;
    businessOwner?: string;
  }
): string {
  let result = templateText;

  const clientName = options.client?.name || 'Cliente';
  const firstName = clientName.split(' ')[0] || 'Cliente';
  const serviceName = options.service?.name || 'seu procedimento';
  const business = options.businessName || 'GR Espaço';
  const owner = options.businessOwner || 'Sua Profissional';

  let dateStr = '';
  let timeStr = '';
  let priceStr = '';

  if (options.appointment) {
    const d = new Date(options.appointment.dateTime);
    dateStr = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    timeStr = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const price = options.appointment.finalPrice || options.service?.price || 0;
    priceStr = price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  } else if (options.service) {
    priceStr = options.service.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  result = result
    .replace(/\{nome\}/gi, clientName)
    .replace(/\{primeiro_nome\}/gi, firstName)
    .replace(/\{servico\}/gi, serviceName)
    .replace(/\{data\}/gi, dateStr || 'a combinar')
    .replace(/\{horario\}/gi, timeStr || 'a combinar')
    .replace(/\{valor\}/gi, priceStr || 'consultar')
    .replace(/\{negocio\}/gi, business)
    .replace(/\{profissional\}/gi, owner);

  return result;
}

export function buildWhatsAppLink(phone: string, text: string): string {
  const cleanPhone = cleanPhoneNumber(phone);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}
