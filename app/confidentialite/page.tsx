import Todo from '@/components/Todo';

export const metadata = { title: 'Confidentialité · Bakea' };

export default function Page() {
  return (
    <main className="narrow">
      <h1>Politique de confidentialité</h1>
      <p>Responsable du traitement : <Todo>Raison sociale</Todo>, 3 rue de Lancry, 75010 Paris — <a href="mailto:bakeacoffee@gmail.com">bakeacoffee@gmail.com</a>.</p>
      <h2>Données collectées</h2>
      <p>Lors d’une précommande : prénom, nom, adresse email, quantité et date de retrait. Les données de carte bancaire sont saisies directement chez Revolut et ne nous sont jamais transmises.</p>
      <h2>Pourquoi</h2>
      <p>Uniquement pour traiter votre commande : vous envoyer la confirmation, préparer et vous remettre votre commande, et respecter nos obligations comptables (base légale : exécution du contrat et obligation légale). Aucune utilisation commerciale, aucune revente.</p>
      <h2>Durée de conservation</h2>
      <p>Les données de commande sont conservées 3 ans pour le suivi client, puis archivées le temps imposé par la loi pour les pièces comptables (10 ans).</p>
      <h2>Destinataires</h2>
      <p>L’équipe Bakea et nos sous-traitants techniques : Supabase (base de données), Vercel (hébergement), Revolut (paiement), Google (envoi des emails).</p>
      <h2>Vos droits</h2>
      <p>Vous pouvez accéder à vos données, les rectifier ou les supprimer, et vous opposer à leur traitement, en écrivant à <a href="mailto:bakeacoffee@gmail.com">bakeacoffee@gmail.com</a>. Vous pouvez aussi saisir la CNIL (cnil.fr).</p>
      <h2>Cookies</h2>
      <p>Ce site n’utilise aucun cookie publicitaire ni de mesure d’audience. Seuls des éléments strictement nécessaires au fonctionnement (paiement, espace admin) peuvent être déposés.</p>
    </main>
  );
}
