import { Appointment, Client, ServiceItem } from '../types';

/**
 * Formats a Date object to Google Calendar UTC string: YYYYMMDDTHHmmssZ
 */
function formatDateToGoogleUTC(date: Date): string {
  return date.toISOString().replace(/-|:|\.\d{3}/g, '');
}

/**
 * Builds a direct 1-click URL to open Google Calendar with all prefilled details
 */
export function buildGoogleCalendarUrl(
  appointment: Appointment,
  client?: Client,
  service?: ServiceItem,
  businessName?: string
): string {
  const start = new Date(appointment.dateTime);
  const duration = service ? service.durationMinutes : 60;
  const end = new Date(start.getTime() + duration * 60 * 1000);

  const startFormatted = formatDateToGoogleUTC(start);
  const endFormatted = formatDateToGoogleUTC(end);

  const clientName = client ? client.name : 'Cliente';
  const serviceName = service ? service.name : 'Atendimento';
  const clientPhone = client?.phone || 'Não informado';
  const priceFormatted = (appointment.finalPrice || service?.price || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const title = `${serviceName} - ${clientName}`;

  const detailsLines = [
    `✨ Atendimento: ${serviceName}`,
    `👤 Cliente: ${clientName}`,
    `📞 Telefone/WhatsApp: ${clientPhone}`,
    `💰 Valor: ${priceFormatted}`,
    `⏱️ Duração estimada: ${duration} minutos`,
    appointment.notes ? `📝 Observações: ${appointment.notes}` : '',
    '',
    `Agendado via GR CRM Autônomo${businessName ? ` (${businessName})` : ''}`,
  ].filter(Boolean);

  const details = detailsLines.join('\n');

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${startFormatted}/${endFormatted}`,
    details: details,
    location: businessName || 'Espaço de Atendimento',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
