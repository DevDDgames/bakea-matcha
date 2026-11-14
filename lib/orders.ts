import 'server-only';
import { db, getSettings } from './supabase-server';
import { capturePaymentIntent, FAILED, getPaymentIntent, PAID } from './stancer';
import { sendConfirmation } from './mail';
import { Order } from './types';

/**
 * Vérifie le paiement Stancer d'une commande en attente et la passe « à récupérer »
 * (puis envoie le mail une seule fois). Idempotent : peut être appelé plusieurs fois.
 */
export async function syncPayment(orderId: string): Promise<Order | null> {
  const { data: order } = await db().from('orders').select('*').eq('id', orderId).maybeSingle<Order>();
  if (!order) return null;
  if (order.status !== 'en_attente_paiement' || !order.stancer_payment_id) return order;

  let pi = await getPaymentIntent(order.stancer_payment_id);
  if (pi.status === 'authorized') pi = await capturePaymentIntent(pi.id).catch(() => pi);

  if (PAID.includes(pi.status) || pi.status === 'authorized') {
    // Le filtre sur le statut garantit qu'un seul appel « gagne » (pas de double mail).
    const { data: updated } = await db()
      .from('orders')
      .update({ status: 'a_recuperer', paid_at: new Date().toISOString() })
      .eq('id', orderId)
      .eq('status', 'en_attente_paiement')
      .select('*')
      .maybeSingle<Order>();
    if (!updated) return (await db().from('orders').select('*').eq('id', orderId).single<Order>()).data;
    return sendAndMark(updated);
  }

  if (FAILED.includes(pi.status)) {
    const { data } = await db().from('orders').update({ status: 'annule' }).eq('id', orderId).select('*').single<Order>();
    return data;
  }
  return order;
}

export async function sendAndMark(order: Order): Promise<Order> {
  try {
    const s = await getSettings();
    await sendConfirmation(order, s.product_name);
    const { data } = await db()
      .from('orders')
      .update({ email_sent_at: new Date().toISOString() })
      .eq('id', order.id)
      .select('*')
      .single<Order>();
    return data ?? order;
  } catch (e) {
    console.error('Envoi du mail impossible', e);
    return order;
  }
}
