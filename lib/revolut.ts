import 'server-only';

// Revolut Business — Merchant API (page de paiement hébergée : Revolut Pay, carte, Apple Pay, Google Pay).
// Doc : https://developer.revolut.com/docs/merchant/merchant-api
const API_VERSION = '2025-12-04';
const base = () =>
  process.env.REVOLUT_ENV === 'sandbox' ? 'https://sandbox-merchant.revolut.com' : 'https://merchant.revolut.com';

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const key = process.env.REVOLUT_SECRET_KEY;
  if (!key) throw new Error('REVOLUT_SECRET_KEY manquante');
  const res = await fetch(base() + path, {
    ...init,
    headers: {
      Authorization: `Bearer ${key}`,
      'Revolut-Api-Version': API_VERSION,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Revolut ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

export type RevolutOrder = {
  id: string;
  token: string;
  state: 'pending' | 'processing' | 'authorised' | 'completed' | 'cancelled' | 'failed';
  amount: number;
  checkout_url: string;
};

export function createRevolutOrder(p: {
  amount: number;
  description: string;
  reference: string;
  orderId: string;
  email: string;
  fullName: string;
  redirectUrl: string;
}) {
  return call<RevolutOrder>('/api/orders', {
    method: 'POST',
    body: JSON.stringify({
      amount: p.amount,
      currency: 'EUR',
      description: p.description,
      customer: { email: p.email, full_name: p.fullName },
      merchant_order_data: { reference: p.reference },
      metadata: { order_id: p.orderId },
      capture_mode: 'automatic',
      expire_pending_after: 'PT30M', // aligné sur la réservation de stock de 30 min
      redirect_url: p.redirectUrl,
    }),
  });
}

export const getRevolutOrder = (id: string) => call<RevolutOrder>(`/api/orders/${id}`);

/** « authorised » = fonds bloqués, la capture automatique suit : la commande est acquise. */
export const PAID = ['authorised', 'completed'];
export const FAILED = ['cancelled', 'failed'];
