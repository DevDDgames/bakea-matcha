# Bakea · Précommande pâte à tartiner matcha

Landing page de précommande (style Luma, DA Bakea) avec paiement **Revolut** (Revolut Pay, carte, Apple Pay, Google Pay), commandes dans **Supabase**,
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

### 2. Revolut Business (Merchant)
1. Activer **Merchant / Accept payments** sur le compte Revolut Business de Bakea.
2. *Merchant → APIs → Merchant API* : copier la **Secret key** (`sk_…`).
   Pour tester sans vrai paiement : créer un compte sur sandbox-business.revolut.com, prendre la clé sandbox
   et mettre `REVOLUT_ENV=sandbox` (cartes de test : https://developer.revolut.com/docs/guides/accept-payments/get-started/test-implementation/test-cards).
3. **Webhook** (confirme la commande même si le client ferme la page après avoir payé), une seule fois :
   ```bash
   curl -X POST https://merchant.revolut.com/api/webhooks \
     -H "Authorization: Bearer sk_VOTRE_CLE" -H "Revolut-Api-Version: 2025-12-04" -H "Content-Type: application/json" \
     -d '{"url":"https://VOTRE-SITE/api/webhooks/revolut","events":["ORDER_COMPLETED","ORDER_AUTHORISED","ORDER_CANCELLED","ORDER_FAILED"]}'
   ```
   (en sandbox : `https://sandbox-merchant.revolut.com/api/webhooks`)

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
| `REVOLUT_SECRET_KEY` | Secret key Merchant API (`sk_…`) |
| `REVOLUT_ENV` | `sandbox` pour tester, `production` ensuite |
| `GMAIL_USER` | adresse Gmail de Bakea |
| `GMAIL_APP_PASSWORD` | mot de passe d'application |
| `NEXT_PUBLIC_SITE_URL` | URL du site, ex. `https://precommande.bakea.fr` |

Redéployer après avoir ajouté les variables.

## Fonctionnement
1. Le client choisit un jour (mardi → dimanche, entre les dates définies dans l'admin, jamais le jour même),
   une quantité (1 à 10), saisit prénom/nom/email et accepte les CGV.
2. Le serveur crée la commande **« Paiement en attente »** dans Supabase (stock vérifié de façon atomique : un panier
   bloque son stock 30 min) puis redirige vers la page de paiement Revolut (expire au bout de 30 min).
3. Au retour, le paiement est vérifié auprès de Revolut (et aussi via le webhook) → commande **« À récupérer »** + email de confirmation (une seule fois).
4. Si le client ferme son navigateur après avoir payé, le webhook valide la commande ; en secours,
   bouton **Vérifier paiement** dans l'admin.
5. Au comptoir : passer la commande en **« Terminé »**.
6. Annulation/remboursement : rembourser depuis Revolut Business, puis passer la commande en « Annulé » (le stock du jour est libéré).

## Développement
```bash
npm install
cp .env.example .env.local   # remplir
npm run dev
```
