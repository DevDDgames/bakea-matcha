import { COMPANY as C } from '@/lib/company';
import Todo from '@/components/Todo';

export const metadata = { title: 'Conditions générales de vente · Bakea' };

export default function Page() {
  return (
    <main className="narrow">
      <h1>Conditions générales de vente</h1>
      <p><i>Précommandes en ligne · version du 14 novembre 2026</i></p>

      <h2>1. Vendeur</h2>
      <p>{C.name}, {C.form}, {C.address} — {C.rcs} — <a href={`mailto:${C.email}`}>{C.email}</a>.</p>

      <h2>2. Produits et prix</h2>
      <p>
        Les caractéristiques (ingrédients, allergènes, contenance, conservation) et le prix sont indiqués sur la page de
        commande. Les prix sont en euros TTC. Maximum 10 pots par commande, dans la limite des stocks.
      </p>

      <h2>3. Commande et paiement</h2>
      <p>
        La commande est payée en ligne via Revolut (Revolut Pay, carte, Apple Pay, Google Pay). Elle est ferme dès le
        paiement accepté ; un email de confirmation vous est alors envoyé.
      </p>

      <h2>4. Retrait uniquement</h2>
      <p>
        Pas de livraison. La commande est à retirer chez Bakea, {C.address}, le jour choisi, aux horaires d’ouverture, sur
        présentation de l’email de confirmation. Un empêchement ? Écrivez-nous, on trouvera une autre date.
      </p>

      <h2>5. Annulation et rétractation</h2>
      <p>
        Vous pouvez annuler gratuitement par email jusqu’à 48 h avant la date de retrait : vous êtes remboursé sous 14 jours.
        S’agissant d’un produit alimentaire susceptible de se détériorer rapidement, le droit de rétractation ne s’applique
        pas (art. L.221-28 du Code de la consommation).
      </p>

      <h2>6. Réclamation et médiation</h2>
      <p>
        Un problème avec votre produit ? Signalez-le au café ou par email : il sera échangé ou remboursé. Les garanties
        légales de conformité s’appliquent. En cas de litige non résolu, vous pouvez saisir gratuitement le médiateur de la
        consommation :{' '}
        {C.mediator.name ? <a href={C.mediator.url}>{C.mediator.name}</a> : <Todo>nom et site du médiateur</Todo>}. Droit français applicable.
      </p>
    </main>
  );
}
