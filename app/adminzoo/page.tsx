'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { browserDb } from '@/lib/supabase-browser';
import { euros, longDate, orderRef } from '@/lib/dates';
import { DEFAULT_SETTINGS, Order, OrderStatus, Settings, STATUS_LABEL } from '@/lib/types';

const configured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<'orders' | 'content'>('orders');

  useEffect(() => {
    if (!configured) return setReady(true);
    const sb = browserDb();
    sb.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    const { data: sub } = sb.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return setIsAdmin(null);
    browserDb().from('admins').select('user_id').eq('user_id', session.user.id).maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));
  }, [session]);

  if (!configured) return <main className="login"><h1>Admin</h1><p>Supabase n’est pas configuré (variables d’environnement manquantes).</p></main>;
  if (!ready) return null;
  if (!session) return <Login />;
  if (isAdmin === null) return <p>Chargement…</p>;
  if (!isAdmin)
    return (
      <main className="login">
        <h1>Accès refusé</h1>
        <p>Le compte {session.user.email} n’est pas administrateur.</p>
        <button className="small-btn" onClick={() => browserDb().auth.signOut()}>Se déconnecter</button>
      </main>
    );

  return (
    <main>
      <h1>Précommandes matcha</h1>
      <div className="tabs">
        <button className={tab === 'orders' ? 'on' : ''} onClick={() => setTab('orders')}>Commandes</button>
        <button className={tab === 'content' ? 'on' : ''} onClick={() => setTab('content')}>Page & produit</button>
        <span className="spacer" />
        <span className="who">{session.user.email}</span>
        <button className="link-btn" onClick={() => browserDb().auth.signOut()}>Déconnexion</button>
      </div>
      {tab === 'orders' ? <Orders session={session} /> : <Content />}
    </main>
  );
}

/* ------------------------------------------------------------------ */
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await browserDb().auth.signInWithPassword({ email, password });
    if (error) setError('Email ou mot de passe incorrect.');
    setLoading(false);
  }
  return (
    <form className="login" onSubmit={submit}>
      <h1>Admin</h1>
      <input className="input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
      <div className="pwd">
        <input className="input" type={showPwd ? 'text' : 'password'} placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        <button type="button" className="pwd-eye" onClick={() => setShowPwd((v) => !v)} aria-label={showPwd ? 'Masquer le mot de passe' : 'Afficher le mot de passe'} aria-pressed={showPwd}>
          {showPwd ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3 3l18 18" /><path d="M10.6 5.1A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a17.6 17.6 0 0 1-3.2 4.2M6.6 6.6C3.9 8.4 2 12 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>
          )}
        </button>
      </div>
      <button className="btn" disabled={loading}>{loading ? 'Connexion…' : 'Se connecter'}</button>
      {error && <div className="error">{error}</div>}
    </form>
  );
}

/* ------------------------------------------------------------------ */
type SortKey = 'number' | 'created_at' | 'last_name' | 'first_name' | 'email' | 'quantity' | 'amount_cents' | 'pickup_date' | 'status';
const COLUMNS: [SortKey, string][] = [
  ['number', 'N°'],
  ['created_at', 'Commandé le'],
  ['last_name', 'Nom'],
  ['first_name', 'Prénom'],
  ['email', 'Email'],
  ['quantity', 'Qté'],
  ['amount_cents', 'Montant'],
  ['pickup_date', 'Retrait'],
  ['status', 'Statut'],
];

function Orders({ session }: { session: Session }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'' | OrderStatus | 'payees'>('payees');
  const [day, setDay] = useState('');
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'pickup_date', dir: 1 });
  const [busy, setBusy] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await browserDb().from('orders').select('*').order('created_at', { ascending: false });
    setOrders((data ?? []) as Order[]);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const paid = orders.filter((o) => o.status === 'a_recuperer' || o.status === 'termine');
  const byDay = useMemo(() => {
    const m = new Map<string, { total: number; left: number }>();
    for (const o of paid) {
      const v = m.get(o.pickup_date) ?? { total: 0, left: 0 };
      v.total += o.quantity;
      if (o.status === 'a_recuperer') v.left += o.quantity;
      m.set(o.pickup_date, v);
    }
    return [...m.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [paid]);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return orders
      .filter((o) => (status === 'payees' ? o.status === 'a_recuperer' || o.status === 'termine' : !status || o.status === status))
      .filter((o) => !day || o.pickup_date === day)
      .filter((o) => !term || `${o.first_name} ${o.last_name} ${o.email} ${orderRef(o.number)}`.toLowerCase().includes(term))
      .sort((a, b) => {
        const x = a[sort.key], y = b[sort.key];
        return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), 'fr')) * sort.dir;
      });
  }, [orders, q, status, day, sort]);

  async function setOrderStatus(o: Order, s: OrderStatus) {
    if (s === 'annule' && !confirm(`Annuler la commande ${orderRef(o.number)} ? (le remboursement se fait depuis Revolut Business)`)) return;
    const { data, error } = await browserDb().from('orders').update({ status: s }).eq('id', o.id).select('*').single();
    if (error) return alert(error.message);
    setOrders((list) => list.map((x) => (x.id === o.id ? (data as Order) : x)));
  }

  async function action(o: Order, act: 'verify' | 'resend') {
    setBusy(o.id + act);
    const res = await fetch('/api/admin/order-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ id: o.id, action: act }),
    });
    const data = await res.json();
    setBusy('');
    if (!res.ok) return alert(data.error);
    setOrders((list) => list.map((x) => (x.id === o.id ? data.order : x)));
    if (act === 'resend') alert('Mail renvoyé ✔');
    if (act === 'verify') alert(`Statut : ${STATUS_LABEL[(data.order as Order).status]}`);
  }

  function exportCsv() {
    const head = ['N°', 'Commandé le', 'Nom', 'Prénom', 'Email', 'Quantité', 'Montant (€)', 'Retrait', 'Statut'];
    const lines = rows.map((o) => [
      orderRef(o.number), new Date(o.created_at).toLocaleString('fr-FR'), o.last_name, o.first_name, o.email,
      o.quantity, (o.amount_cents / 100).toFixed(2).replace('.', ','), o.pickup_date, STATUS_LABEL[o.status],
    ]);
    const csv = [head, ...lines].map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    a.download = `commandes-bakea-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }

  const toggleSort = (key: SortKey) => setSort((s) => ({ key, dir: s.key === key ? ((-s.dir) as 1 | -1) : 1 }));

  return (
    <>
      <div className="stats">
        <div className="stat"><small>Commandes payées</small><b>{paid.length}</b></div>
        <div className="stat"><small>Pots vendus</small><b>{paid.reduce((n, o) => n + o.quantity, 0)}</b></div>
        <div className="stat"><small>Pots à remettre</small><b>{paid.filter((o) => o.status === 'a_recuperer').reduce((n, o) => n + o.quantity, 0)}</b></div>
        <div className="stat"><small>Chiffre d’affaires</small><b>{euros(paid.reduce((n, o) => n + o.amount_cents, 0))}</b></div>
      </div>

      {byDay.length > 0 && (
        <div className="byday">
          <button className={!day ? 'on' : ''} onClick={() => setDay('')}>Tous les jours</button>
          {byDay.map(([d, v]) => (
            <button key={d} className={day === d ? 'on' : ''} onClick={() => setDay(day === d ? '' : d)} title={`${v.left} pot(s) encore à remettre`}>
              {longDate(d).replace(/ décembre| novembre/, '')} · <b>{v.total}</b> pots
            </button>
          ))}
        </div>
      )}

      <div className="toolbar">
        <input className="input grow" placeholder="Rechercher nom, email, BK-0001…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input" value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
          <option value="payees">Payées (à récupérer + terminées)</option>
          <option value="">Tous les statuts</option>
          {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <div className="mobile-sort">
          <select className="input" value={sort.key} onChange={(e) => setSort({ key: e.target.value as SortKey, dir: sort.dir })} aria-label="Trier par">
            {COLUMNS.map(([k, label]) => <option key={k} value={k}>Trier : {label}</option>)}
          </select>
          <button type="button" className="small-btn icon-btn" onClick={() => setSort({ ...sort, dir: (-sort.dir) as 1 | -1 })} aria-label={sort.dir === 1 ? 'Ordre croissant' : 'Ordre décroissant'}>
            <SortIcon dir={sort.dir} />
          </button>
        </div>
        <button className="small-btn" onClick={load} disabled={loading}>
          <svg className={loading ? 'spin' : ''} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 12a9 9 0 1 1-2.64-6.36" /><path d="M21 3v6h-6" /></svg>
          Actualiser
        </button>
        <button className="small-btn" onClick={exportCsv}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></svg>
          Exporter CSV
        </button>
      </div>

      <div className="table-wrap">
        <table className="orders">
          <thead>
            <tr>
              {COLUMNS.map(([k, label]) => (
                <th key={k} aria-sort={sort.key === k ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'}>
                  <button type="button" className={'th-btn' + (sort.key === k ? ' on' : '')} onClick={() => toggleSort(k)}>
                    {label}
                    <SortIcon dir={sort.key === k ? sort.dir : 0} />
                  </button>
                </th>
              ))}
              <th className="th-plain">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id} className={o.status === 'termine' || o.status === 'annule' ? 'done' : ''}>
                <td data-label="N°" className="c-ref"><b>{orderRef(o.number)}</b></td>
                <td data-label="Commandé le">{new Date(o.created_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}</td>
                <td data-label="Nom">{o.last_name}</td>
                <td data-label="Prénom">{o.first_name}</td>
                <td data-label="Email" className="c-email"><a href={`mailto:${o.email}`}>{o.email}</a></td>
                <td data-label="Quantité"><b>{o.quantity}</b></td>
                <td data-label="Montant">{euros(o.amount_cents)}</td>
                <td data-label="Retrait">{longDate(o.pickup_date)}</td>
                <td data-label="Statut" className="c-status">
                  <select className={`status ${o.status}`} value={o.status} onChange={(e) => setOrderStatus(o, e.target.value as OrderStatus)}>
                    {o.status === 'en_attente_paiement' && <option value="en_attente_paiement">Paiement en attente</option>}
                    <option value="a_recuperer">À récupérer</option>
                    <option value="termine">Terminé</option>
                    <option value="annule">Annulé</option>
                  </select>
                </td>
                <td className="c-actions">
                  {o.status === 'en_attente_paiement' && (
                    <button className="link-btn" disabled={!!busy} onClick={() => action(o, 'verify')}>{busy === o.id + 'verify' ? '…' : 'Vérifier paiement'}</button>
                  )}
                  {(o.status === 'a_recuperer' || o.status === 'termine') && (
                    <button className="link-btn" disabled={!!busy} onClick={() => action(o, 'resend')} title={o.email_sent_at ? `Mail envoyé le ${new Date(o.email_sent_at).toLocaleString('fr-FR')}` : 'Mail non envoyé'}>
                      {busy === o.id + 'resend' ? '…' : o.email_sent_at ? 'Renvoyer le mail' : '⚠ Envoyer le mail'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr className="empty"><td colSpan={10} style={{ textAlign: 'center', padding: 30, color: 'var(--muted)' }}>{loading ? 'Chargement…' : 'Aucune commande'}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
function Content() {
  const [s, setS] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [uploading, setUploading] = useState('');

  useEffect(() => {
    browserDb().from('settings').select('*').eq('id', 1).single().then(({ data }) => {
      const g = Array.isArray(data?.gallery) ? data.gallery : [];
      setS({ ...DEFAULT_SETTINGS, ...(data ?? {}), gallery: [0, 1, 2].map((i) => g[i] ?? null) });
    });
  }, []);
  if (!s) return <p>Chargement…</p>;

  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => { setS({ ...s, [k]: v }); setMsg(''); };

  async function upload(file: File, slot: 'cover' | 0 | 1 | 2) {
    if (!file.type.startsWith('image/')) return alert('Choisissez une image.');
    if (file.size > 8 * 1024 * 1024) return alert('Image trop lourde (8 Mo max).');
    setUploading(String(slot));
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${slot === 'cover' ? 'cover' : 'photo-' + (slot + 1)}-${Date.now()}.${ext}`;
    const sb = browserDb();
    const { error } = await sb.storage.from('images').upload(path, file, { cacheControl: '31536000', upsert: false });
    setUploading('');
    if (error) return alert(error.message);
    const url = sb.storage.from('images').getPublicUrl(path).data.publicUrl;
    if (slot === 'cover') set('product_image_url', url);
    else set('gallery', s!.gallery.map((g, i) => (i === slot ? url : g)));
  }

  async function save() {
    setSaving(true);
    const { error } = await browserDb().from('settings').update({
      sales_open: s!.sales_open, page_title: s!.page_title, intro: s!.intro, product_name: s!.product_name,
      price_cents: s!.price_cents, volume: s!.volume, description: s!.description, ingredients: s!.ingredients,
      allergens: s!.allergens, conservation: s!.conservation, best_before: s!.best_before, origin: s!.origin,
      producer: s!.producer, product_image_url: s!.product_image_url, gallery: s!.gallery,
      max_per_order: s!.max_per_order, daily_cap: s!.daily_cap, start_date: s!.start_date, end_date: s!.end_date,
      closed_dates: s!.closed_dates, updated_at: new Date().toISOString(),
    }).eq('id', 1);
    setSaving(false);
    setMsg(error ? '❌ ' + error.message : '✔ Enregistré — la page est à jour');
  }

  const Field = ({ k, label, area, hint }: { k: keyof Settings; label: string; area?: boolean; hint?: string }) => (
    <div className={area ? 'full' : ''}>
      <span className="label">{label}</span>
      {area ? (
        <textarea className="input" value={String(s[k] ?? '')} onChange={(e) => set(k, e.target.value as never)} />
      ) : (
        <input className="input" value={String(s[k] ?? '')} onChange={(e) => set(k, e.target.value as never)} />
      )}
      {hint && <div className="hint">{hint}</div>}
    </div>
  );

  const slots: { slot: 'cover' | 0 | 1 | 2; label: string; url: string | null }[] = [
    { slot: 'cover', label: 'Visuel principal (carré)', url: s.product_image_url },
    ...[0, 1, 2].map((i) => ({ slot: i as 0 | 1 | 2, label: `Photo ${i + 1}`, url: s.gallery[i] })),
  ];

  return (
    <div>
      <span className="label">Photos</span>
      <div className="uploads">
        {slots.map(({ slot, label, url }) => (
          <div className="upload" key={String(slot)}>
            <div className="thumb">{url ? <img src={url} alt="" /> : label}</div>
            <label>
              {uploading === String(slot) ? 'Envoi…' : url ? 'Remplacer' : 'Ajouter'}
              <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], slot)} />
            </label>
            {url && (
              <> · <button className="link-btn" onClick={() => (slot === 'cover' ? set('product_image_url', null) : set('gallery', s.gallery.map((g, i) => (i === slot ? null : g))))}>Retirer</button></>
            )}
          </div>
        ))}
      </div>

      <div className="form-grid">
        <div className="full">
          <label className="check">
            <input type="checkbox" checked={s.sales_open} onChange={(e) => set('sales_open', e.target.checked)} />
            <span><b>Précommandes ouvertes</b> (décocher pour fermer le formulaire)</span>
          </label>
        </div>
        {Field({ k: 'page_title', label: 'Titre de la page', hint: 'Ce qui suit « @ » s’affiche en orange italique.' })}
        {Field({ k: 'product_name', label: 'Nom du produit' })}
        <div>
          <span className="label">Prix (€)</span>
          <input className="input" type="number" min={0.5} step={0.5} value={s.price_cents / 100} onChange={(e) => set('price_cents', Math.round(Number(e.target.value) * 100))} />
          <div className="hint">S’applique aux nouvelles commandes uniquement.</div>
        </div>
        {Field({ k: 'volume', label: 'Contenance' })}
        <div>
          <span className="label">Stock par jour de retrait (pots)</span>
          <input className="input" type="number" min={0} value={s.daily_cap} onChange={(e) => set('daily_cap', Number(e.target.value))} />
        </div>
        <div>
          <span className="label">Quantité max par commande</span>
          <input className="input" type="number" min={1} max={50} value={s.max_per_order} onChange={(e) => set('max_per_order', Number(e.target.value))} />
        </div>
        <div>
          <span className="label">Premier jour de retrait</span>
          <input className="input" type="date" value={s.start_date} onChange={(e) => set('start_date', e.target.value)} />
        </div>
        <div>
          <span className="label">Dernier jour de retrait</span>
          <input className="input" type="date" value={s.end_date} onChange={(e) => set('end_date', e.target.value)} />
        </div>
        <div className="full">
          <span className="label">Jours exceptionnellement fermés</span>
          <input className="input" placeholder="ex : 2026-12-08, 2026-12-15" value={s.closed_dates.join(', ')}
            onChange={(e) => set('closed_dates', e.target.value.split(/[,\s]+/).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)))} />
          <div className="hint">Les lundis sont toujours fermés. Format AAAA-MM-JJ, séparés par des virgules.</div>
        </div>
        {Field({ k: 'intro', label: 'Texte « À propos »', area: true, hint: 'Ligne vide = nouveau paragraphe.' })}
        {Field({ k: 'description', label: 'Description du produit', area: true })}
        {Field({ k: 'ingredients', label: 'Ingrédients (obligatoire)', area: true, hint: 'Par ordre décroissant de poids, avec le % des ingrédients mis en avant (ex. matcha).' })}
        {Field({ k: 'allergens', label: 'Allergènes (obligatoire)', area: true })}
        {Field({ k: 'conservation', label: 'Conservation', area: true })}
        {Field({ k: 'best_before', label: 'Date de durabilité (DDM)', area: true })}
        {Field({ k: 'origin', label: 'Origine' })}
        {Field({ k: 'producer', label: 'Fabriqué par' })}
      </div>

      <div className="save-bar">
        <button className="small-btn primary" onClick={save} disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer'}</button>
        <a className="small-btn" href="/" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>Voir la page ↗</a>
        {msg && <span className="ok">{msg}</span>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
function SortIcon({ dir }: { dir: 1 | -1 | 0 }) {
  return (
    <svg className="sort-icon" width="10" height="14" viewBox="0 0 10 14" aria-hidden>
      <path d="M5 1.5 8.5 5.5h-7z" fill={dir === 1 ? 'var(--orange)' : 'currentColor'} opacity={dir === 1 ? 1 : 0.3} />
      <path d="M5 12.5 1.5 8.5h7z" fill={dir === -1 ? 'var(--orange)' : 'currentColor'} opacity={dir === -1 ? 1 : 0.3} />
    </svg>
  );
}
