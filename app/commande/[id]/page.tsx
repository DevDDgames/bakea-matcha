import Link from 'next/link';
import { syncPayment } from '@/lib/orders';
import { getSettings, supabaseConfigured } from '@/lib/supabase-server';
import { euros, longDate, OPENING_HOURS, orderRef, weekday } from '@/lib/dates';
import { SHOP } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false } };

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const valid = /^[0-9a-f-]{36}$/i.test(id);
  const order = valid && supabaseConfigured() ? await syncPayment(id).catch(() => null) : null;
  const s = await getSettings();

  if (!order) {
    return (
      <main className="narrow">
        <h1>Commande introuvable</h1>
        <p><Link href="/">← Retour à la précommande</Link></p>
      </main>
    );
  }

  const paid = order.status === 'a_recuperer' || order.status === 'termine';

  if (!paid) {
    return (
      <main className="narrow">
        <h1>{order.status === 'annule' ? 'Paiement non abouti' : 'Paiement en cours de vérification…'}</h1>
        <p>
          {order.status === 'annule'
            ? 'Votre paiement n’a pas été validé, aucune somme n’a été débitée. Vous pouvez refaire une précommande.'
            : 'Nous n’avons pas encore la confirmation de votre banque. Rafraîchissez cette page dans quelques instants.'}
        </p>
        <p><Link href="/#commander" style={{ color: 'var(--orange)' }}>← Revenir à la précommande</Link></p>
      </main>
    );
  }

  return (
    <main className="narrow">
      <p style={{ fontSize: 40, margin: 0 }}>🍵</p>
      <h1>Merci {order.first_name}, c’est réservé !</h1>
      <div className="card" style={{ margin: '0 0 20px' }}>
        <div className="card-head">Commande {orderRef(order.number)}</div>
        <div className="card-body">
          <table className="spec">
            <tbody>
              <tr><th>Produit</th><td>{order.quantity} × {s.product_name} ({s.volume})</td></tr>
              <tr><th>Total payé</th><td>{euros(order.amount_cents)}</td></tr>
              <tr><th>Retrait</th><td><b>{longDate(order.pickup_date)}</b><br />entre {OPENING_HOURS[weekday(order.pickup_date)]}</td></tr>
              <tr><th>Adresse</th><td>Bakea, {SHOP.address}, {SHOP.city}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="pickup-only">
        <span aria-hidden style={{ fontSize: 20 }}>📍</span>
        <div><strong>Uniquement en retrait au café</strong>Présentez le mail de confirmation (envoyé à {order.email}) ou le numéro {orderRef(order.number)} au comptoir.</div>
      </div>
      <p><Link href="/" style={{ color: 'var(--orange)' }}>← Retour</Link></p>
    </main>
  );
}
