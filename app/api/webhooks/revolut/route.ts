import { NextResponse } from 'next/server';
import { db, supabaseConfigured } from '@/lib/supabase-server';
import { syncPayment } from '@/lib/orders';

export const dynamic = 'force-dynamic';

// Webhook Revolut (ORDER_COMPLETED, ORDER_AUTHORISED, ORDER_CANCELLED…).
// On ne fait pas confiance au contenu : on se contente de relire la commande chez Revolut (syncPayment).
export async function POST(req: Request) {
  if (!supabaseConfigured()) return NextResponse.json({ ok: false }, { status: 503 });
  const body = await req.json().catch(() => ({}));
  const revolutId = typeof body.order_id === 'string' ? body.order_id : '';
  if (!revolutId) return NextResponse.json({ ok: true });

  const { data } = await db().from('orders').select('id').eq('payment_id', revolutId).maybeSingle();
  if (data) {
    try {
      await syncPayment(data.id);
    } catch (e) {
      console.error('Webhook Revolut', e);
      return NextResponse.json({ ok: false }, { status: 500 }); // Revolut réessaiera
    }
  }
  return NextResponse.json({ ok: true });
}
