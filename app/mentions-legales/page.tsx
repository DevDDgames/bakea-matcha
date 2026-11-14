import Todo from '@/components/Todo';

export const metadata = { title: 'Mentions légales · Bakea' };

export default function Page() {
  return (
    <main className="narrow">
      <h1>Mentions légales</h1>
      <h2>Éditeur du site</h2>
      <p>
        <Todo>Raison sociale, ex. BAKEA SAS</Todo>, <Todo>forme juridique</Todo> au capital de <Todo>montant</Todo> €<br />
        Siège social : 3 rue de Lancry, 75010 Paris<br />
        RCS Paris <Todo>numéro</Todo> · SIRET <Todo>numéro</Todo><br />
        N° TVA intracommunautaire : <Todo>numéro</Todo><br />
        Directeur·rice de la publication : <Todo>Prénom Nom</Todo><br />
        Contact : <a href="mailto:bakeacoffee@gmail.com">bakeacoffee@gmail.com</a>
      </p>
      <h2>Hébergement</h2>
      <p>
        Site : Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis — vercel.com<br />
        Données : Supabase Inc., 970 Toa Payoh North #07-04, Singapour — supabase.com (serveurs dans l’Union européenne)
      </p>
      <h2>Paiement</h2>
      <p>Les paiements sont traités par Revolut Bank UAB, établissement de crédit agréé (Revolut Business, Merchant API). Bakea n’a jamais accès à vos données bancaires.</p>
      <h2>Propriété intellectuelle</h2>
      <p>Les textes, logos et photos de ce site appartiennent à Bakea. Toute reproduction sans autorisation est interdite.</p>
    </main>
  );
}
