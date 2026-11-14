import { COMPANY as C } from '@/lib/company';
import Todo from '@/components/Todo';

export const metadata = { title: 'Mentions légales · Bakea' };

export default function Page() {
  return (
    <main className="narrow">
      <h1>Mentions légales</h1>

      <h2>Éditeur</h2>
      <p>
        {C.name}, {C.form} au capital de {C.capital ? `${C.capital} €` : <Todo>montant</Todo>}<br />
        {C.address}<br />
        {C.rcs} · SIRET {C.siret}<br />
        TVA intracommunautaire : {C.vat}<br />
        Directrice de la publication : {C.publisher}<br />
        Contact : <a href={`mailto:${C.email}`}>{C.email}</a>
      </p>

      <h2>Hébergement</h2>
      <p>
        Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.<br />
        Base de données : Supabase Inc. (serveurs dans l’Union européenne).
      </p>
    </main>
  );
}
