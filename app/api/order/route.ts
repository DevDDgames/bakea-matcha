import { NextResponse } from 'next/server';
import { db, getSettings, supabaseConfigured } from '@/lib/supabase-server';
import { createPaymentIntent } from '@/lib/stancer';
import { orderRef } from '@/lib/dates';
import { Order } from '@/lib/types';

export const dynamic = 'force-dynamic';

const ERRORS: Record<string, string> = {
  SALES_CLOSED: 'Les précommandes sont fermées.',
  BAD_QUANTITY: 'Quantité invalide.',
  BAD_DATE: "Ce jour de retrait n'est pas disponible.",
  SOLD_OUT: 'Plus assez de pots pour ce jour-là, choisissez une autre date ou une quantité plus petite.',
};

export async function POST(req: Request) {
  if (!supabaseConfigured() || !process.env.STANCER_SECRET_KEY) {
    return NextResponse.json({ error: 'Le paiement n’est pas encore configuré.' }, { status: 503 });
  }
  const b = await req.json().catch(() => ({}));
  if (b.website) return NextResponse.json({ error: 'Erreur' }, { status: 400 }); // pot de miel anti-robots

  const firstName = String(b.firstName ?? '').trim();
  const lastName = String(b.lastName ?? '').trim();
  const email = String(b.email ?? '').trim();
  const quantity = Number(b.quantity);
  const pickupDate = String(b.pickupDate ?? '');

  if (!firstName || !lastName || firstName.length > 80 || lastName.length > 80)
    return NextResponse.json({ error: 'Nom et prénom requis.' }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 200)
    return NextResponse.json({ error: 'Adresse email invalide.' }, { status: 400 });
  if (!Number.isInteger(quantity) || quantity < 1) return NextResponse.json({ error: ERRORS.BAD_QUANTITY }, { status: 400 });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(pickupDate)) return NextResponse.json({ error: ERRORS.BAD_DATE }, { status: 400 });
  if (b.acceptCgv !== true) return NextResponse.json({ error: 'Merci d’accepter les CGV.' }, { status: 400 });

  // 1) Création atomique (stock vérifié en base)
  const { data, error } = await db().rpc('create_order', {
    p_first_name: firstName,
    p_last_name: lastName,
    p_email: email,
    p_quantity: quantity,
    p_pickup_date: pickupDate,
  });
  if (error) {
    const code = Object.keys(ERRORS).find((k) => error.message.includes(k));
    if (!code) console.error(error);
    return NextResponse.json({ error: code ? ERRORS[code] : 'Erreur, réessayez.' }, { status: code ? 409 : 500 });
  }
  const order = data as Order;

  // 2) Paiement Stancer
  try {
    const s = await getSettings();
    const site = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
    const pi = await createPaymentIntent({
      amount: order.amount_cents,
      description: `Bakea ${orderRef(order.number)} ${order.quantity}x ${s.product_name}`,
      orderId: order.id,
      returnUrl: `${site}/commande/${order.id}`,
    });
    await db().from('orders').update({ stancer_payment_id: pi.id }).eq('id', order.id);
    return NextResponse.json({ url: pi.url });
  } catch (e) {
    console.error(e);
    await db().from('orders').update({ status: 'annule', note: 'Erreur création paiement' }).eq('id', order.id);
    return NextResponse.json({ error: 'Le paiement est indisponible pour le moment, réessayez.' }, { status: 502 });
  }
}
