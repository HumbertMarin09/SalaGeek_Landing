const zone = 'America/Mexico_City';

export function slotTime(iso: string): string {
  return new Intl.DateTimeFormat('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: zone,
  }).format(new Date(iso));
}

export function longDate(iso: string): string {
  return new Intl.DateTimeFormat('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: zone,
  }).format(new Date(iso));
}

export const CANONICAL_ORIGIN = 'https://salageek.com';
