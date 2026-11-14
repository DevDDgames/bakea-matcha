# Bakea · Précommande pâte à tartiner matcha

Landing page de précommande (style Luma, DA Bakea) avec paiement **Stancer**, commandes dans **Supabase**,
email de confirmation envoyé depuis le **Gmail de Bakea**, et un **espace admin** (connexion Supabase Auth).

- `/` : la page publique (fiche produit, 3 photos, choix du jour de retrait, formulaire, paiement)
- `/commande/<id>` : page de retour après paiement (vérifie le paiement, envoie le mail)
- `/admin` : non lié depuis le site. Deux onglets :
  - **Commandes** : tri sur chaque colonne, recherche, filtres statut / jour, statut *À récupérer → Terminé*,
    vérifier un paiement, renvoyer le mail, export CSV, totaux par jour
  - **Page & produit** : photos (visuel + 3 photos), textes, fiche produit, prix, stock par jour,
    quantité max, dates, jours fermés, ouverture/fermeture des précommandes
- `/cgv`, `/mentions-legales`, `/confidentialite` : à compléter (passages surlignés en jaune)

## Mise en place (≈ 20 min)

### 1. Supabase
1. Créer un projet sur supabase.com (région **EU – Paris/Frankfurt**).
2. *SQL Editor* → coller tout `supabase/schema.sql` → **Run**.
3. *Authentication → Users → Add user* : email + mot de passe de l'admin (cocher *Auto confirm*).
4. *SQL Editor* :
   ```sql
   insert into public.admins (user_id) select id from auth.users where email = 'EMAIL_DE_L_ADMIN';
   ```
5. *Authentication → Sign In / Providers* : désactiver **Allow new users to sign up** (seuls les comptes créés à la main peuvent se connecter).
6. *Project Settings → API* : récupérer l'URL, la clé `anon` et la clé `service_role`.

### 2. Stancer
1. Compte sur manage.stancer.com → *Développeurs* → clé secrète **`stest_…`** pour tester, puis **`sprod_…`** en production.
2. Cartes de test : voir https://docs.stancer.com/en/API.html#test-cards

### 3. Gmail (expéditeur des confirmations)
1. Sur le compte Google de Bakea : activer la **validation en 2 étapes**.
2. *Compte Google → Sécurité → Mots de passe des applications* → créer « Bakea site » → copier le code à 16 caractères.

### 4. Vercel
Importer le projet, puis renseigner les variables de `.env.example` dans *Settings → Environment Variables* :

| Variable | Valeur |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | clé `anon` |
| `SUPABASE_SERVICE_ROLE_KEY` | clé `service_role` (secrète) |
| `STANCER_SECRET_KEY` | `stest_…` puis `sprod_…` |
| `GMAIL_USER` | adresse Gmail de Bakea |
| `GMAIL_APP_PASSWORD` | mot de passe d'application |
| `NEXT_PUBLIC_SITE_URL` | URL du site, ex. `https://precommande.bakea.fr` |

Redéployer après avoir ajouté les variables.

## Fonctionnement
1. Le client choisit un jour (mardi → dimanche, entre les dates définies dans l'admin, jamais le jour même),
   une quantité (1 à 10), saisit prénom/nom/email et accepte les CGV.
2. Le serveur crée la commande **« Paiement en attente »** dans Supabase (stock vérifié de façon atomique : un panier
   bloque son stock 30 min) puis redirige vers la page de paiement Stancer.
3. Au retour, le paiement est vérifié auprès de Stancer → commande **« À récupérer »** + email de confirmation (une seule fois).
4. Si le client ferme son navigateur pendant le paiement, la commande reste « Paiement en attente » :
   bouton **Vérifier paiement** dans l'admin.
5. Au comptoir : passer la commande en **« Terminé »**.
6. Annulation/remboursement : rembourser dans Stancer, puis passer la commande en « Annulé » (le stock du jour est libéré).

## Développement
```bash
npm install
cp .env.example .env.local   # remplir
npm run dev
```
