'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { dayNum, euros, longDate, weekday } from '@/lib/dates';

// Colonnes du calendrier : mardi → dimanche (fermé le lundi)
const COLS = ['mar', 'mer', 'jeu', 'ven', 'sam', 'dim'];
const colOf = (d: string) => ({ 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 0: 6 } as Record<number, number>)[weekday(d)];

function PayLogos() {
  return (
    <div className="paylogos" aria-label="Moyens de paiement acceptés : Revolut Pay, Visa, Mastercard, Apple Pay, Google Pay">
      <span className="pl pl-revolut" title="Revolut Pay"><b>R</b> Pay</span>
      <span className="pl pl-visa" title="Visa">VISA</span>
      <span className="pl pl-mc" title="Mastercard">
        <svg width="30" height="18" viewBox="0 0 30 18" aria-hidden><circle cx="11" cy="9" r="8" fill="#EB001B" /><circle cx="19" cy="9" r="8" fill="#F79E1B" /><path d="M15 2.7a8 8 0 0 1 0 12.6 8 8 0 0 1 0-12.6z" fill="#FF5F00" /></svg>
      </span>
      <span className="pl pl-apple" title="Apple Pay">
        <svg width="12" height="14" viewBox="0 0 384 512" aria-hidden><path fill="currentColor" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
        Pay
      </span>
      <span className="pl pl-google" title="Google Pay"><b><i style={{ color: '#4285F4' }}>G</i></b> Pay</span>
    </div>
  );
}

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
        {COLS.map((c) => <div className="dow" key={c}>{c}</div>)}
        {days.map((d) => (
          <button
            type="button"
            key={d.date}
            role="radio"
            aria-checked={d.date === date}
            className={'day' + (d.date === date ? ' sel' : '')}
            style={{ gridColumnStart: colOf(d.date) }}
            disabled={d.remaining <= 0}
            onClick={() => pickDay(d)}
            title={d.remaining <= 0 ? 'Complet' : `${longDate(d.date)} · ${d.hours}`}
          >
            <span className="d2">{dayNum(d.date)}</span>
            {d.remaining <= 0 && <span className="d3">complet</span>}
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
        <div className="qty-total">
          <span className="qty-sum">{qty} × {euros(priceCents)} = <b>{euros(total)}</b></span>
          <span className="qty-hint">max {maxPerOrder} par commande</span>
        </div>
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
      <div className="secure">🔒 Paiement 100 % sécurisé via Revolut</div>
      <PayLogos />
      {error && <div className="error" role="alert">{error}</div>}
    </form>
  );
}
