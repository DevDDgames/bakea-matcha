export type Settings = {
  sales_open: boolean;
  page_title: string;
  intro: string;
  product_name: string;
  price_cents: number;
  volume: string;
  description: string;
  ingredients: string;
  allergens: string;
  conservation: string;
  best_before: string;
  origin: string;
  producer: string;
  product_image_url: string | null;
  gallery: (string | null)[];
  max_per_order: number;
  daily_cap: number;
  start_date: string;
  end_date: string;
  closed_dates: string[];
};

export type OrderStatus = 'en_attente_paiement' | 'a_recuperer' | 'termine' | 'annule';

export type Order = {
  id: string;
  number: number;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  quantity: number;
  unit_price_cents: number;
  amount_cents: number;
  pickup_date: string;
  status: OrderStatus;
  stancer_payment_id: string | null;
  paid_at: string | null;
  email_sent_at: string | null;
  note: string | null;
};

export const STATUS_LABEL: Record<OrderStatus, string> = {
  en_attente_paiement: 'Paiement en attente',
  a_recuperer: 'À récupérer',
  termine: 'Terminé',
  annule: 'Annulé',
};

export const DEFAULT_SETTINGS: Settings = {
  sales_open: true,
  page_title: 'Pâte à tartiner Matcha @Bakea',
  intro:
    "Hey ! 🍵\n\nPour les fêtes, on lance une édition limitée de notre pâte à tartiner au matcha, préparée chez nous, rue de Lancry.\n\nPrécommandez votre pot, choisissez votre jour de retrait entre le 1er et le 20 décembre, et passez le chercher au café.",
  product_name: 'Pâte à tartiner matcha',
  price_cents: 1900,
  volume: '200 ml',
  description:
    'Une pâte à tartiner onctueuse au matcha japonais et au chocolat blanc, avec une pointe de fleur de sel. Douce, végétale, légèrement amère : parfaite sur une tartine, une crêpe, ou directement à la cuillère. [TEXTE À ADAPTER]',
  ingredients:
    "Chocolat blanc 45 % (sucre, beurre de cacao, lait entier en poudre, émulsifiant : lécithine de tournesol, arôme naturel de vanille), purée d'amande blanche 30 %, huile de tournesol, sucre, matcha 4 %, fleur de sel. [À VÉRIFIER AVEC LA RECETTE]",
  allergens: 'Lait, fruits à coque (amande). Fabriqué dans un atelier qui utilise aussi : gluten, œufs, autres fruits à coque. [À VÉRIFIER]',
  conservation:
    "À conserver à température ambiante (< 25 °C), à l'abri de la lumière et de l'humidité. Après ouverture : à consommer sous 4 semaines. [À VÉRIFIER]",
  best_before: 'À consommer de préférence avant la date indiquée sur le pot (environ 3 mois après fabrication). [À VÉRIFIER]',
  origin: "Matcha bio d'Uji (Japon). [À VÉRIFIER]",
  producer: 'Bakea — 3 rue de Lancry, 75010 Paris',
  product_image_url: null,
  gallery: [null, null, null],
  max_per_order: 10,
  daily_cap: 30,
  start_date: '2026-12-01',
  end_date: '2026-12-20',
  closed_dates: [],
};

export const SHOP = {
  name: 'Bakea',
  address: '3 rue de Lancry',
  city: '75010 Paris',
  instagram: 'https://www.instagram.com/bakea.coffee',
  maps: 'https://www.google.com/maps/search/?api=1&query=Bakea+3+rue+de+Lancry+75010+Paris',
};
