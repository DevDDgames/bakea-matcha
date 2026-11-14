import Todo from '@/components/Todo';

export const metadata = { title: 'Conditions générales de vente · Bakea' };

export default function Page() {
  return (
    <main className="narrow">
      <h1>Conditions générales de vente</h1>
      <p><i>Version du 14 novembre 2026 — précommande « pâte à tartiner matcha ».</i></p>

      <h2>1. Vendeur</h2>
      <p><Todo>Raison sociale</Todo>, enseigne Bakea, 3 rue de Lancry, 75010 Paris — SIRET <Todo>numéro</Todo> — <a href="mailto:bakeacoffe@gmail.com">bakeacoffe@gmail.com</a>.</p>

      <h2>2. Objet</h2>
      <p>Les présentes conditions encadrent la précommande en ligne de produits alimentaires Bakea, à retirer exclusivement en boutique. Passer commande implique leur acceptation.</p>

      <h2>3. Produits</h2>
      <p>Les caractéristiques essentielles (ingrédients, allergènes, contenance, conservation) sont indiquées dans la fiche produit, sur la page de commande. Les photos sont non contractuelles. L’offre est valable dans la limite des stocks disponibles par jour de retrait et de {10} pots maximum par commande.</p>

      <h2>4. Prix</h2>
      <p>Les prix sont indiqués en euros toutes taxes comprises (TVA incluse). Aucun frais de livraison : le produit est à retirer en boutique.</p>

      <h2>5. Commande et paiement</h2>
      <p>Le client choisit son jour de retrait, la quantité, indique ses coordonnées, accepte les CGV puis paie par carte bancaire sur la page sécurisée de Stancer. La commande n’est ferme qu’après acceptation du paiement ; un email de confirmation récapitulant la commande et la date de retrait est alors envoyé.</p>

      <h2>6. Retrait — pas de livraison</h2>
      <p>La commande est <b>uniquement à retirer</b> chez Bakea, 3 rue de Lancry, 75010 Paris, le jour choisi (parmi les dates proposées, du mardi au dimanche) aux horaires d’ouverture. Le client présente l’email de confirmation ou son numéro de commande. Aucune livraison ni envoi postal n’est possible.</p>
      <p>En cas d’empêchement, contactez-nous : nous ferons notre possible pour décaler le retrait. Une commande non retirée <Todo>au plus tard le 31 décembre</Todo> sans nouvelle du client <Todo>reste due et n’est pas remboursée — à valider</Todo>.</p>

      <h2>7. Annulation et droit de rétractation</h2>
      <p>Le client peut annuler sa commande gratuitement par email jusqu’à <Todo>48 h</Todo> avant la date de retrait ; il est alors remboursé sous 14 jours sur sa carte.</p>
      <p>Conformément à l’article L.221-28 4° du Code de la consommation, le droit de rétractation ne peut être exercé pour les denrées alimentaires susceptibles de se détériorer ou de se périmer rapidement, une fois le produit remis. <Todo>À valider selon la durée de conservation réelle du produit</Todo></p>

      <h2>8. Conformité</h2>
      <p>Le client vérifie la commande lors du retrait. Tout défaut doit être signalé à l’équipe sur place ou par email ; le produit sera alors échangé ou remboursé. Les garanties légales de conformité (art. L.217-3 et suivants du Code de la consommation) s’appliquent.</p>

      <h2>9. Données personnelles</h2>
      <p>Voir notre <a href="/confidentialite">politique de confidentialité</a>.</p>

      <h2>10. Litiges et médiation</h2>
      <p>En cas de litige, contactez-nous d’abord à bakeacoffe@gmail.com. À défaut d’accord, le client peut recourir gratuitement au médiateur de la consommation : <Todo>nom et site du médiateur auquel Bakea adhère</Todo>. Droit applicable : droit français.</p>
    </main>
  );
}
