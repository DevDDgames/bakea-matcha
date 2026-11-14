'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { dayName, dayNum, euros, longDate } from '@/lib/dates';

export type DayOption = { date: string; hours: string; remaining: number };

export default function OrderForm(props: {
  productName: string;
  volume: string;
  priceCents: number;
  maxPerOrder: number;
  days: DayOption[];
}) {
  const { productName, volume, priceCents, maxPerOrder, days } = props;
  const [date, setDate] = useState<string>('');
  const [qty, setQty] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [accept, setAccept] = useState(false);
  const [website, setWebsite] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selected = days.find((d) => d.date === date);
  const max = Math.max(1, Math.min(maxPerOrder, selected ? selected.remaining : maxPerOrder));
  const total = priceCents * qty;
  const valid = useMemo(
    () => !!selected && selected.remaining >= qty && firstName.trim() && lastName.trim() && /\S+@\S+\.\S+/.test(email) && accept,
    [selected, qty, firstName, lastName, email, accept],
  );

  function pickDay(d: DayOption) {
    setDate(d.date);
    setQty((q) => Math.min(q, Math.max(1, Math.min(maxPerOrder, d.remaining))));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || loading) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, quantity: qty, pickupDate: date, acceptCgv: accept, website }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'Erreur, réessayez.');
      window.location.href = data.url;
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  if (!days.length) return <p style={{ margin: 0 }}>Plus aucune date de retrait disponible. Merci pour votre enthousiasme ! 💚</p>;

  return (
    <form onSubmit={submit} noValidate>
      <div className="price-row">
        <span className="name">{productName}</span>
        <span className="price"><b>{euros(priceCents)}</b> / {volume}</span>
      </div>

      <span className="label">1. Jour de retrait</span>
      <div className="days" role="radiogroup" aria-label="Jour de retrait">
        {days.map((d) => (
          <button
            type="button"
            key={d.date}
            role="radio"
            aria-checked={d.date === date}
            className={'day' + (d.date === date ? ' sel' : '')}
            disabled={d.remaining <= 0}
            onClick={() => pickDay(d)}
            title={d.remaining <= 0 ? 'Complet' : `${longDate(d.date)} · ${d.hours}`}
          >
            <div className="d1">{dayName(d.date).slice(0, 3)}</div>
            <div className="d2">{dayNum(d.date)}</div>
            <div className="d3">{d.remaining <= 0 ? 'complet' : 'déc.'}</div>
          </button>
        ))}
      </div>
      <div className="day-info">
        {selected ? `Retrait le ${longDate(selected.date)}, entre ${selected.hours}` + (selected.remaining <= 10 ? ` · plus que ${selected.remaining} pot${selected.remaining > 1 ? 's' : ''}` : '') : ''}
      </div>

      <span className="label">2. Quantité</span>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div className="qty">
          <button type="button" aria-label="Moins" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1}>−</button>
          <span aria-live="polite">{qty}</span>
          <button type="button" aria-label="Plus" onClick={() => setQty((q) => Math.min(max, q + 1))} disabled={qty >= max}>+</button>
        </div>
        <span className="qty-hint">max {maxPerOrder} par commande</span>
      </div>

      <span className="label">3. Vos coordonnées</span>
      <div className="grid2">
        <input className="input" placeholder="Prénom" autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} maxLength={80} required />
        <input className="input" placeholder="Nom" autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} maxLength={80} required />
      </div>
      <input className="input" style={{ marginTop: 10 }} type="email" placeholder="Email (pour la confirmation)" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={200} required />
      <div className="hp" aria-hidden>
        <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="Site web" />
      </div>

      <label className="check">
        <input type="checkbox" checked={accept} onChange={(e) => setAccept(e.target.checked)} />
        <span>
          J’ai lu et j’accepte les <Link href="/cgv" target="_blank" style={{ color: 'var(--orange)' }}>conditions générales de vente</Link>, et je note que la commande est <b>à retirer au café</b> (3 rue de Lancry, Paris 10e) le jour choisi.
        </span>
      </label>

      <button className="btn" disabled={!valid || loading}>
        {loading ? 'Redirection vers le paiement…' : `Payer ${euros(total)} et réserver`}
      </button>
      <div className="secure">🔒 Paiement sécurisé par carte via Stancer</div>
      {error && <div className="error" role="alert">{error}</div>}
    </form>
  );
}
