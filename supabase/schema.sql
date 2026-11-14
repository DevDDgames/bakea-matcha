-- =====================================================================
-- Bakea · Précommande pâte à tartiner matcha
-- À exécuter une fois dans Supabase > SQL Editor > New query > Run
-- =====================================================================

-- ---------- Admins (liés à Supabase Auth) ----------
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ---------- Contenu de la page / fiche produit (1 seule ligne) ----------
create table if not exists public.settings (
  id int primary key default 1 check (id = 1),
  sales_open boolean not null default true,
  page_title text not null default 'Pâte à tartiner Matcha @Bakea',
  intro text not null default '',
  product_name text not null default 'Pâte à tartiner matcha',
  price_cents int not null default 1900 check (price_cents >= 50),
  volume text not null default '200 ml',
  description text not null default '',
  ingredients text not null default '',
  allergens text not null default '',
  conservation text not null default '',
  best_before text not null default '',
  origin text not null default '',
  producer text not null default '',
  product_image_url text,
  gallery jsonb not null default '[null, null, null]'::jsonb,
  max_per_order int not null default 10 check (max_per_order between 1 and 50),
  daily_cap int not null default 30 check (daily_cap >= 0),
  start_date date not null default '2026-12-01',
  end_date date not null default '2026-12-20',
  closed_dates date[] not null default '{}',
  updated_at timestamptz not null default now()
);

insert into public.settings (id, intro, description, ingredients, allergens, conservation, best_before, origin, producer)
values (
  1,
  E'Hey ! 🍵\n\nPour les fêtes, on lance une édition limitée de notre pâte à tartiner au matcha, préparée chez nous, rue de Lancry.\n\nPrécommandez votre pot, choisissez votre jour de retrait entre le 1er et le 20 décembre, et passez le chercher au café. On en profite pour vous offrir… un sourire et peut-être un café 😉',
  E'Une pâte à tartiner onctueuse au matcha japonais et au chocolat blanc, avec une pointe de fleur de sel. Douce, végétale, légèrement amère : parfaite sur une tartine, une crêpe, ou directement à la cuillère. [TEXTE À ADAPTER]',
  E'Chocolat blanc 45 % (sucre, beurre de cacao, lait entier en poudre, émulsifiant : lécithine de tournesol, arôme naturel de vanille), purée d''amande blanche 30 %, huile de tournesol, sucre, matcha 4 %, fleur de sel. [À VÉRIFIER AVEC LA RECETTE]',
  E'Lait, fruits à coque (amande). Fabriqué dans un atelier qui utilise aussi : gluten, œufs, autres fruits à coque. [À VÉRIFIER]',
  E'À conserver à température ambiante (< 25 °C), à l''abri de la lumière et de l''humidité. Ne pas mettre au réfrigérateur. Après ouverture : à consommer sous 4 semaines. [À VÉRIFIER]',
  E'À consommer de préférence avant la date indiquée sur le pot (environ 3 mois après fabrication). [À VÉRIFIER]',
  E'Matcha bio d''Uji (Japon). [À VÉRIFIER]',
  E'Bakea — 3 rue de Lancry, 75010 Paris'
) on conflict (id) do nothing;

-- ---------- Commandes ----------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  number bigint generated always as identity,
  created_at timestamptz not null default now(),
  first_name text not null check (char_length(first_name) between 1 and 80),
  last_name text not null check (char_length(last_name) between 1 and 80),
  email text not null check (char_length(email) between 3 and 200),
  quantity int not null check (quantity between 1 and 50),
  unit_price_cents int not null,
  amount_cents int not null,
  pickup_date date not null,
  status text not null default 'en_attente_paiement'
    check (status in ('en_attente_paiement', 'a_recuperer', 'termine', 'annule')),
  stancer_payment_id text,
  paid_at timestamptz,
  email_sent_at timestamptz,
  note text
);
create index if not exists orders_pickup_idx on public.orders (pickup_date);
create index if not exists orders_status_idx on public.orders (status);

-- Quantités déjà prises pour chaque jour (commandes payées + paniers en cours de paiement < 30 min)
create or replace function public.reserved_by_day()
returns table (pickup_date date, reserved bigint)
language sql stable security definer set search_path = public as $$
  select o.pickup_date, sum(o.quantity)::bigint
  from public.orders o
  where o.status in ('a_recuperer', 'termine')
     or (o.status = 'en_attente_paiement' and o.created_at > now() - interval '30 minutes')
  group by o.pickup_date;
$$;

-- Création atomique d'une commande avec contrôle de stock (verrou pour éviter la survente)
create or replace function public.create_order(
  p_first_name text, p_last_name text, p_email text, p_quantity int, p_pickup_date date
) returns public.orders
language plpgsql security definer set search_path = public as $$
declare
  s public.settings;
  taken bigint;
  o public.orders;
begin
  perform pg_advisory_xact_lock(424242);
  select * into s from public.settings where id = 1;
  if not s.sales_open then raise exception 'SALES_CLOSED'; end if;
  if p_quantity < 1 or p_quantity > s.max_per_order then raise exception 'BAD_QUANTITY'; end if;
  if p_pickup_date < s.start_date or p_pickup_date > s.end_date
     or extract(isodow from p_pickup_date) = 1
     or p_pickup_date = any (s.closed_dates)
     or p_pickup_date <= (now() at time zone 'Europe/Paris')::date then
    raise exception 'BAD_DATE';
  end if;
  select coalesce(sum(reserved), 0) into taken from public.reserved_by_day() r where r.pickup_date = p_pickup_date;
  if taken + p_quantity > s.daily_cap then raise exception 'SOLD_OUT'; end if;

  insert into public.orders (first_name, last_name, email, quantity, unit_price_cents, amount_cents, pickup_date)
  values (trim(p_first_name), trim(p_last_name), lower(trim(p_email)), p_quantity, s.price_cents, s.price_cents * p_quantity, p_pickup_date)
  returning * into o;
  return o;
end;
$$;

-- ---------- Sécurité (RLS) ----------
alter table public.admins enable row level security;
alter table public.settings enable row level security;
alter table public.orders enable row level security;

drop policy if exists "admins read self" on public.admins;
create policy "admins read self" on public.admins for select to authenticated using (user_id = auth.uid());

drop policy if exists "settings public read" on public.settings;
create policy "settings public read" on public.settings for select using (true);
drop policy if exists "settings admin update" on public.settings;
create policy "settings admin update" on public.settings for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Les commandes ne sont lisibles / modifiables que par les admins (le site public passe par le serveur)
drop policy if exists "orders admin read" on public.orders;
create policy "orders admin read" on public.orders for select to authenticated using (public.is_admin());
drop policy if exists "orders admin update" on public.orders;
create policy "orders admin update" on public.orders for update to authenticated using (public.is_admin()) with check (public.is_admin());

revoke execute on function public.create_order(text, text, text, int, date) from public, anon, authenticated;
revoke execute on function public.reserved_by_day() from public, anon;

-- ---------- Stockage des photos ----------
insert into storage.buckets (id, name, public) values ('images', 'images', true)
on conflict (id) do nothing;

drop policy if exists "images admin insert" on storage.objects;
create policy "images admin insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'images' and public.is_admin());
drop policy if exists "images admin update" on storage.objects;
create policy "images admin update" on storage.objects for update to authenticated
  using (bucket_id = 'images' and public.is_admin());
drop policy if exists "images admin delete" on storage.objects;
create policy "images admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'images' and public.is_admin());

-- =====================================================================
-- Ajouter un admin : 1) Supabase > Authentication > Users > Add user (email + mot de passe)
--                    2) puis exécuter (en remplaçant l'email) :
-- insert into public.admins (user_id) select id from auth.users where email = 'bakeacoffe@gmail.com';
-- =====================================================================
