import { NextResponse } from 'next/server';
import { db, requireAdmin } from '@/lib/supabase-server';
import { sendAndMark, syncPayment } from '@/lib/orders';
import { Order } from '@/lib/types';

export const dynamic = 'force-dynamic';

// Actions admin qui nécessitent le serveur : vérifier un paiement Revolut, renvoyer le mail.
export async function POST(req: Request) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const { id, action } = await req.json();

  try {
    if (action === 'verify') {
      return NextResponse.json({ order: await syncPayment(id) });
    }
    if (action === 'resend') {
      const { data: order } = await db().from('orders').select('*').eq('id', id).single<Order>();
      if (!order || !['a_recuperer', 'termine'].includes(order.status))
        return NextResponse.json({ error: 'Commande non payée' }, { status: 400 });
      const updated = await sendAndMark(order);
      if (updated.email_sent_at === order.email_sent_at)
        return NextResponse.json({ error: "Échec de l'envoi (vérifiez GMAIL_USER / GMAIL_APP_PASSWORD)" }, { status: 500 });
      return NextResponse.json({ order: updated });
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: String((e as Error).message) }, { status: 500 });
  }
  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}
