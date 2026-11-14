import 'server-only';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DEFAULT_SETTINGS, Settings } from './types';

let admin: SupabaseClient | null = null;

export const supabaseConfigured = () =>
  !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

/** Client « service role » : uniquement côté serveur, contourne la RLS. */
export function db() {
  if (!supabaseConfigured()) throw new Error('Supabase non configuré (variables d’environnement manquantes)');
  if (!admin) {
    admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return admin;
}

export async function getSettings(): Promise<Settings> {
  if (!supabaseConfigured()) return DEFAULT_SETTINGS;
  const { data, error } = await db().from('settings').select('*').eq('id', 1).single();
  if (error || !data) return DEFAULT_SETTINGS;
  return { ...DEFAULT_SETTINGS, ...data, gallery: normalizeGallery(data.gallery) };
}

export function normalizeGallery(g: unknown): (string | null)[] {
  const arr = Array.isArray(g) ? g : [];
  return [0, 1, 2].map((i) => (typeof arr[i] === 'string' && arr[i] ? arr[i] : null));
}

/** Quantité déjà réservée par jour de retrait. */
export async function getReserved(): Promise<Record<string, number>> {
  if (!supabaseConfigured()) return {};
  const { data } = await db().rpc('reserved_by_day');
  const out: Record<string, number> = {};
  for (const r of (data ?? []) as { pickup_date: string; reserved: number }[]) out[r.pickup_date] = Number(r.reserved);
  return out;
}

/** Vérifie le jeton Supabase Auth d'une requête et que l'utilisateur est admin. */
export async function requireAdmin(req: Request) {
  const token = req.headers.get('authorization')?.replace(/^Bearer /, '');
  if (!token) return null;
  const { data } = await db().auth.getUser(token);
  if (!data.user) return null;
  const { data: row } = await db().from('admins').select('user_id').eq('user_id', data.user.id).maybeSingle();
  return row ? data.user : null;
}
