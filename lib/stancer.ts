import 'server-only';

// Stancer (groupe Iliad) — API v2 « payment intents » + page de paiement hébergée.
// Doc : https://docs.stancer.com/en/API.html
const API = 'https://api.stancer.com/v2';

function auth() {
  const key = process.env.STANCER_SECRET_KEY;
  if (!key) throw new Error('STANCER_SECRET_KEY manquante');
  return 'Basic ' + Buffer.from(key + ':').toString('base64');
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(API + path, {
    ...init,
    headers: { Authorization: auth(), 'Content-Type': 'application/json', ...(init?.headers || {}) },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Stancer ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

export type PaymentIntent = {
  id: string;
  status:
    | 'require_payment_method'
    | 'require_authentication'
    | 'require_authorization'
    | 'authorized'
    | 'processing'
    | 'captured'
    | 'canceled'
    | 'unpaid';
  url: string;
  amount: number;
  capture: boolean;
};

export function createPaymentIntent(p: { amount: number; description: string; orderId: string; returnUrl: string }) {
  return call<PaymentIntent>('/payment_intents/', {
    method: 'POST',
    body: JSON.stringify({
      amount: p.amount,
      currency: 'eur',
      description: p.description.slice(0, 64),
      order_id: p.orderId.slice(0, 36),
      methods_allowed: ['card'],
      return_url: p.returnUrl,
      capture: true,
    }),
  });
}

export const getPaymentIntent = (id: string) => call<PaymentIntent>(`/payment_intents/${id}`);

export const capturePaymentIntent = (id: string) =>
  call<PaymentIntent>(`/payment_intents/${id}/capture`, { method: 'POST', body: '{}' });

export const PAID = ['processing', 'captured'];
export const FAILED = ['canceled', 'unpaid'];
