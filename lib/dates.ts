// Dates de retrait — tout est manipulé en chaînes 'YYYY-MM-DD' (heure de Paris).

// 0 = dimanche … 6 = samedi. Lundi (1) fermé.
export const OPENING_HOURS: Record<number, string> = {
  0: '10h – 18h',
  2: '9h – 18h',
  3: '9h – 18h',
  4: '13h – 18h',
  5: '9h – 18h',
  6: '10h – 18h30',
};

const DAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

const parse = (d: string) => new Date(d + 'T12:00:00Z');
const fmt = (d: Date) => d.toISOString().slice(0, 10);

export const weekday = (d: string) => parse(d).getUTCDay();
export const dayName = (d: string) => DAYS[weekday(d)];
export const dayNum = (d: string) => parse(d).getUTCDate();
export const monthName = (d: string) => MONTHS[parse(d).getUTCMonth()];

/** « mardi 1er décembre » */
export function longDate(d: string) {
  const n = dayNum(d);
  return `${dayName(d)} ${n === 1 ? '1er' : n} ${monthName(d)}`;
}

export function todayParis() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' }).format(new Date());
}

/** Jours de retrait possibles : ouverts (mar → dim), dans la période, à partir de demain. */
export function pickupDays(start: string, end: string, closed: string[] = []) {
  const today = todayParis();
  const out: string[] = [];
  for (let d = parse(start); fmt(d) <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const s = fmt(d);
    if (d.getUTCDay() === 1 || closed.includes(s) || s <= today) continue;
    out.push(s);
  }
  return out;
}

export const euros = (cents: number) =>
  (cents / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: cents % 100 ? 2 : 0 });

export const orderRef = (n: number) => 'BK-' + String(n).padStart(4, '0');
