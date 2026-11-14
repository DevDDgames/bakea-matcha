import { COMPANY as C } from '@/lib/company';

export const metadata = { title: 'Confidentialité · Bakea' };

export default function Page() {
  return (
    <main className="narrow">
      <h1>Confidentialité</h1>
      <p>
        <b>Qui ?</b> {C.name} ({C.address}) est responsable de vos données.
      </p>
      <p>
        <b>Quoi et pourquoi ?</b> Vos nom, prénom, email, quantité et date de retrait servent uniquement à traiter votre
        précommande et à vous envoyer la confirmation. Vos données bancaires sont saisies chez Revolut, nous n’y avons jamais accès.
      </p>
      <p>
        <b>Avec qui ?</b> Seulement l’équipe Bakea et nos prestataires techniques : Supabase (base de données), Vercel
        (hébergement), Revolut (paiement), Google (envoi des emails). Aucune revente, aucune publicité.
      </p>
      <p>
        <b>Combien de temps ?</b> 3 ans, puis la durée légale de conservation des pièces comptables.
      </p>
      <p>
        <b>Vos droits :</b> accès, rectification, suppression, opposition, en écrivant à{' '}
        <a href={`mailto:${C.email}`}>{C.email}</a>. Vous pouvez aussi saisir la CNIL (cnil.fr).
      </p>
      <p>
        <b>Cookies :</b> aucun cookie publicitaire ni de mesure d’audience.
      </p>
    </main>
  );
}
