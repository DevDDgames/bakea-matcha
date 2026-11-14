import { getReserved, getSettings } from '@/lib/supabase-server';
import { dayNum, euros, longDate, monthName, OPENING_HOURS, pickupDays, weekday } from '@/lib/dates';
import { SHOP } from '@/lib/types';
import CoverArt from '@/components/CoverArt';
import OrderForm, { DayOption } from '@/components/OrderForm';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [s, reserved] = await Promise.all([getSettings(), getReserved()]);
  const days: DayOption[] = pickupDays(s.start_date, s.end_date, s.closed_dates).map((d) => ({
    date: d,
    hours: OPENING_HOURS[weekday(d)],
    remaining: Math.max(0, s.daily_cap - (reserved[d] ?? 0)),
  }));
  const photos = s.gallery;
  const hasPhotos = photos.some(Boolean);
  const [titleMain, titleAt] = s.page_title.split('@');

  const spec: [string, string][] = [
    ['Produit', s.product_name],
    ['Contenance', s.volume],
    ['Prix', `${euros(s.price_cents)} le pot`],
    ['Ingrédients', s.ingredients],
    ['Allergènes', s.allergens],
    ['Origine', s.origin],
    ['Conservation', s.conservation],
    ['Date de durabilité', s.best_before],
    ['Fabriqué par', s.producer],
  ].filter(([, v]) => v && v.trim()) as [string, string][];

  return (
    <main className="page">
      {/* ---------- Colonne gauche ---------- */}
      <aside className="side">
        <div className="cover">
          {s.product_image_url ? <img src={s.product_image_url} alt={s.product_name} /> : <CoverArt />}
        </div>

        <div className="host">
          <div className="host-avatar">bakea</div>
          <div>
            <small>Présenté par</small>
            <strong>Bakea</strong>
          </div>
          <a className="follow" href={SHOP.instagram} target="_blank" rel="noreferrer">Suivre</a>
        </div>

        <div className="side-section">
          <h3>Retrait en boutique</h3>
          <p>
            {SHOP.address}, {SHOP.city}
            <br />
            Mar, mer, ven 9h–18h · Jeu 13h–18h
            <br />
            Sam 10h–18h30 · Dim 10h–18h
            <br />
            Fermé le lundi
          </p>
        </div>

        <div className="tags">
          <span className="tag"># Matcha</span>
          <span className="tag"># Édition Noël</span>
          <span className="tag"># Fait maison</span>
        </div>
      </aside>

      {/* ---------- Colonne principale ---------- */}
      <section>
        <h1 className="title">
          {titleMain.trim()}
          {titleAt !== undefined && <> <em>@{titleAt.trim()}</em></>}
        </h1>

        <div className="meta">
          <div className="meta-icon">
            <div className="cal"><span>{monthName(s.start_date).slice(0, 4).toUpperCase()}.</span><span>{dayNum(s.start_date)}→{dayNum(s.end_date)}</span></div>
          </div>
          <div className="meta-text">
            <strong>Retrait du {longDate(s.start_date).replace(/^\S+ /, '')} au {longDate(s.end_date)}</strong>
            <span>Du mardi au dimanche, aux horaires du café</span>
          </div>
        </div>
        <div className="meta">
          <div className="meta-icon" aria-hidden>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z" /><circle cx="12" cy="10" r="2.5" /></svg>
          </div>
          <div className="meta-text">
            <strong><a href={SHOP.maps} target="_blank" rel="noreferrer">Bakea ↗</a></strong>
            <span>{SHOP.address}, {SHOP.city}</span>
          </div>
        </div>

        <div className="card" id="commander">
          <div className="card-head">Précommande</div>
          <div className="card-body">
            <div className="pickup-only">
              <span aria-hidden style={{ fontSize: 20 }}>📍</span>
              <div>
                <strong>Uniquement en retrait au café</strong>
                Bakea, {SHOP.address}, {SHOP.city}. Pas de livraison ni d’envoi.
              </div>
            </div>
            {s.sales_open ? (
              <OrderForm
                productName={s.product_name}
                volume={s.volume}
                priceCents={s.price_cents}
                maxPerOrder={s.max_per_order}
                days={days}
              />
            ) : (
              <p style={{ margin: 0 }}>Les précommandes sont fermées pour le moment. Suivez-nous sur Instagram pour la suite !</p>
            )}
          </div>
        </div>

        <div className="section">
          <h2>À propos</h2>
          <div className="prose">
            {s.intro.split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}
            {s.description && <p>{s.description}</p>}
          </div>
        </div>

        <div className="section">
          <h2>Photos</h2>
          <div className="gallery">
            {photos.map((url, i) =>
              url ? (
                <div className="ph filled" key={i}><img src={url} alt={`${s.product_name} — photo ${i + 1}`} /></div>
              ) : (
                <div className="ph" key={i}>{hasPhotos ? '' : `Photo ${i + 1}`}</div>
              ),
            )}
          </div>
        </div>

        <div className="section">
          <h2>Fiche produit</h2>
          <table className="spec">
            <tbody>
              {spec.map(([k, v]) => (
                <tr key={k}><th>{k}</th><td style={{ whiteSpace: 'pre-line' }}>{v}</td></tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="section">
          <h2>Lieu</h2>
          <p style={{ margin: 0 }}>
            <strong>Bakea</strong><br />
            {SHOP.address}, {SHOP.city}<br />
            <a href={SHOP.maps} target="_blank" rel="noreferrer" style={{ color: 'var(--orange)' }}>Ouvrir dans Maps ↗</a>
          </p>
        </div>
      </section>
    </main>
  );
}
