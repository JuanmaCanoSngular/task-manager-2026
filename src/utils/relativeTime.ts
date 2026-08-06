const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const WEEKDAYS = [
  'domingo',
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
] as const;

const MONTHS = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
] as const;

const pad2 = (n: number) => n.toString().padStart(2, '0');

const timeOf = (d: Date) => `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;

const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

/** Inicio del lunes de la semana ISO-local (lunes = inicio). */
const startOfWeek = (d: Date) => {
  const day = startOfDay(d);
  const dow = day.getDay(); // 0=dom … 6=sáb
  const offset = dow === 0 ? 6 : dow - 1;
  day.setDate(day.getDate() - offset);
  return day;
};

export const RECENT_TASK_MS = 30 * MINUTE;

export const isRecentlyCreated = (iso: string | undefined, now = new Date()): boolean => {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return false;
  const age = now.getTime() - t;
  return age >= 0 && age < RECENT_TASK_MS;
};

/**
 * Fecha de creación en castellano, relativa.
 * Ej.: "Hace 23 minutos", "Ayer a las 03:00", "El martes de la semana pasada".
 */
export const formatRelativeCreatedAt = (iso: string, now = new Date()): string => {
  const created = new Date(iso);
  if (Number.isNaN(created.getTime())) return '';

  const diff = now.getTime() - created.getTime();
  if (diff < 0) return 'Ahora';

  if (diff < MINUTE) return 'Ahora';
  if (diff < HOUR) {
    const mins = Math.floor(diff / MINUTE);
    return mins === 1 ? 'Hace 1 minuto' : `Hace ${mins} minutos`;
  }

  const today = startOfDay(now);
  const createdDay = startOfDay(created);
  const dayDiff = Math.round((today.getTime() - createdDay.getTime()) / DAY);

  if (dayDiff === 0) {
    if (diff < DAY) {
      const hours = Math.floor(diff / HOUR);
      if (hours < 12) {
        return hours === 1 ? 'Hace 1 hora' : `Hace ${hours} horas`;
      }
    }
    return `Hoy a las ${timeOf(created)}`;
  }

  if (dayDiff === 1) {
    return `Ayer a las ${timeOf(created)}`;
  }

  const thisWeek = startOfWeek(now);
  const lastWeek = new Date(thisWeek);
  lastWeek.setDate(lastWeek.getDate() - 7);
  const weekday = WEEKDAYS[created.getDay()];

  if (createdDay >= thisWeek) {
    return `El ${weekday} a las ${timeOf(created)}`;
  }

  if (createdDay >= lastWeek) {
    return `El ${weekday} de la semana pasada`;
  }

  const day = created.getDate();
  const month = MONTHS[created.getMonth()];
  if (created.getFullYear() === now.getFullYear()) {
    return `El ${day} de ${month}`;
  }
  return `El ${day} de ${month} de ${created.getFullYear()}`;
};
