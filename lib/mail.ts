import 'server-only';
import nodemailer from 'nodemailer';
import { Order, SHOP } from './types';
import { euros, longDate, OPENING_HOURS, orderRef, weekday } from './dates';

// Envoi via le Gmail de Bakea (SMTP + « mot de passe d'application » Google).
function transport() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
  });
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export function confirmationEmail(o: Order, productName: string, siteUrl: string) {
  const ref = orderRef(o.number);
  const date = longDate(o.pickup_date);
  const hours = OPENING_HOURS[weekday(o.pickup_date)];
  const subject = `Votre précommande ${ref} — retrait le ${date} 🍵`;

  const text = `Bonjour ${o.first_name},

Merci pour votre précommande chez Bakea !

Commande : ${ref}
${o.quantity} × ${productName} — ${euros(o.amount_cents)} (payé)

RETRAIT UNIQUEMENT EN BOUTIQUE
Le ${date}, entre ${hours}
Bakea — ${SHOP.address}, ${SHOP.city}

Présentez simplement ce mail (ou votre numéro ${ref}) au comptoir.
Pas d'envoi postal ni de livraison.

À très vite,
L'équipe Bakea
${siteUrl}`;

  const row = (k: string, v: string) =>
    `<tr><td style="padding:10px 0;border-bottom:1px solid #eadfcb;color:#8a7a66;font-size:14px;width:40%">${k}</td><td style="padding:10px 0;border-bottom:1px solid #eadfcb;font-size:15px;color:#2a1d12;font-weight:600">${v}</td></tr>`;

  const html = `<!doctype html><html lang="fr"><body style="margin:0;background:#f6efe1;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#2a1d12">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6efe1;padding:32px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fffaf0;border-radius:20px;overflow:hidden;border:1px solid #eadfcb">
<tr><td style="padding:28px 28px 8px;text-align:center">
  <div style="font-family:Georgia,'Times New Roman',serif;font-size:44px;font-weight:900;color:#ff4a1c;letter-spacing:-1px;line-height:1">bakea</div>
  <div style="font-family:Georgia,serif;font-style:italic;color:#ff4a1c;font-size:16px;margin-top:6px">Coffee shop à impact positif</div>
</td></tr>
<tr><td style="padding:16px 28px 0">
  <h1 style="font-family:Georgia,serif;font-size:26px;margin:0 0 8px;color:#2a1d12">Merci ${esc(o.first_name)} !</h1>
  <p style="margin:0 0 16px;font-size:15px;line-height:1.5;color:#4b3b2b">Votre précommande est confirmée et payée. On vous attend au café pour la récupérer.</p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    ${row('Commande', ref)}
    ${row('Produit', `${o.quantity} × ${esc(productName)}`)}
    ${row('Total payé', euros(o.amount_cents))}
    ${row('Retrait', `${date}<br><span style="font-weight:400;color:#4b3b2b">entre ${hours}</span>`)}
  </table>
</td></tr>
<tr><td style="padding:20px 28px">
  <div style="background:#ff4a1c;color:#fffaf0;border-radius:14px;padding:16px 18px;font-size:14px;line-height:1.5">
    <strong style="font-size:15px">📍 Retrait uniquement en boutique</strong><br>
    Bakea — ${SHOP.address}, ${SHOP.city}<br>
    Aucune livraison ni envoi postal. Présentez ce mail ou le numéro <strong>${ref}</strong> au comptoir.
  </div>
</td></tr>
<tr><td style="padding:0 28px 28px;font-size:13px;color:#8a7a66;line-height:1.5">
  Un empêchement ? Répondez simplement à ce mail.<br>
  À très vite,<br>L'équipe Bakea · <a href="${SHOP.instagram}" style="color:#ff4a1c">@bakea.coffee</a>
</td></tr>
</table>
<p style="font-size:11px;color:#a8977f;margin-top:16px"><a href="${siteUrl}/cgv" style="color:#a8977f">Conditions générales de vente</a></p>
</td></tr></table></body></html>`;

  return { subject, text, html };
}

export async function sendConfirmation(o: Order, productName: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
  const { subject, text, html } = confirmationEmail(o, productName, siteUrl);
  await transport().sendMail({
    from: `"Bakea" <${process.env.GMAIL_USER}>`,
    to: o.email,
    replyTo: process.env.GMAIL_USER,
    subject,
    text,
    html,
  });
}
