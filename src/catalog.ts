export type Gender = 'women' | 'men' | 'kids' | 'unisex';
export type Category = 'sneakers' | 'slides' | 'boots' | 'sport';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type ColorId =
  'white' | 'black' | 'brown' | 'green' | 'blue' | 'grey' | 'sand' | 'pink' | 'navy';
export type SortId = 'popular' | 'price-asc' | 'price-desc' | 'new';

export interface Product {
  readonly id: string;
  readonly title: string;
  readonly brand: string;
  readonly price: number;
  readonly compareAt?: number;
  readonly gender: Gender;
  readonly category: Category;
  readonly color: ColorId;
  readonly sizes: readonly number[];
  readonly season: Season;
  readonly badge?: string;
  readonly stock: boolean;
  /** File name on Wikimedia Commons. */
  readonly image: string;
  readonly blurb: string;
  readonly rank: number;
}

export interface Filters {
  readonly q: string;
  readonly brand: string;
  readonly gender: string;
  readonly category: string;
  readonly color: string;
  readonly size: string;
  readonly season: string;
  readonly min: number;
  readonly max: number;
  readonly sort: SortId;
  readonly page: number;
}

export const PRICE_CEILING = 8000;
export const PAGE_SIZE = 9;

export const COLORS: readonly { id: ColorId; label: string; hex: string }[] = [
  { id: 'white', label: 'Білий', hex: '#f4f4f4' },
  { id: 'black', label: 'Чорний', hex: '#1c1c1c' },
  { id: 'brown', label: 'Коричневий', hex: '#8a5a3a' },
  { id: 'green', label: 'Зелений', hex: '#2f6b45' },
  { id: 'blue', label: 'Блакитний', hex: '#8eb4d4' },
  { id: 'grey', label: 'Сірий', hex: '#9aa0a6' },
  { id: 'sand', label: 'Пісок', hex: '#d8c3a5' },
  { id: 'pink', label: 'Рожевий', hex: '#e7a3b5' },
  { id: 'navy', label: 'Темно-синій', hex: '#24365c' },
];

export const BRANDS = [
  'Nike',
  'Adidas',
  'New Balance',
  'Jordan',
  'ASICS',
  'Converse',
  'Puma',
  'Dr. Martens',
  'Timberland',
] as const;

export const PRODUCTS: readonly Product[] = [
  {
    id: 'nike-air-force-1',
    title: "Air Force 1 '07",
    brand: 'Nike',
    price: 5300,
    gender: 'unisex',
    category: 'sneakers',
    color: 'white',
    sizes: [37, 38, 39, 40, 41, 42, 43, 44, 45],
    season: 'spring',
    badge: 'Хіт',
    stock: true,
    image: 'Nike air Force 1 white on white.jpg',
    blurb: 'Класичний білий силует із шкіряним верхом і амортизацією Air.',
    rank: 1,
  },
  {
    id: 'nike-air-max-90',
    title: 'Air Max 90',
    brand: 'Nike',
    price: 6200,
    compareAt: 6900,
    gender: 'men',
    category: 'sneakers',
    color: 'black',
    sizes: [40, 41, 42, 43, 44, 45, 46],
    season: 'autumn',
    stock: true,
    image: 'Nike Air Max 90.jpg',
    blurb: 'Видима вставка Air і рельєфний верх. Класика з дев’яностих.',
    rank: 2,
  },
  {
    id: 'nike-air-max-97',
    title: 'Air Max 97',
    brand: 'Nike',
    price: 7100,
    gender: 'unisex',
    category: 'sneakers',
    color: 'grey',
    sizes: [38, 39, 40, 41, 42, 43, 44, 45],
    season: 'autumn',
    badge: 'Новинка',
    stock: true,
    image: 'Nike Air Max 97.jpg',
    blurb: 'Хвилеподібний силует і повнорозмірна подушка Air.',
    rank: 3,
  },
  {
    id: 'nike-dunk-low',
    title: 'Dunk Low Retro',
    brand: 'Nike',
    price: 5600,
    gender: 'women',
    category: 'sneakers',
    color: 'green',
    sizes: [36, 37, 38, 39, 40, 41],
    season: 'spring',
    badge: 'Хіт',
    stock: true,
    image: 'Nike Dunk Low Retro "Varsity Green".jpg',
    blurb: 'Баскетбольний низький профіль у зелено-білому кольорі.',
    rank: 4,
  },
  {
    id: 'nike-pegasus-38',
    title: 'Zoom Pegasus 38',
    brand: 'Nike',
    price: 4800,
    gender: 'men',
    category: 'sport',
    color: 'white',
    sizes: [40, 41, 42, 43, 44, 45, 46],
    season: 'summer',
    stock: true,
    image: 'Nike Zoom Pegasus 38 running shoe.jpg',
    blurb: 'Універсальні бігові кросівки з відгуком Zoom Air.',
    rank: 5,
  },
  {
    id: 'nike-victori-one',
    title: 'Victori One Slide',
    brand: 'Nike',
    price: 1450,
    gender: 'men',
    category: 'slides',
    color: 'black',
    sizes: [40, 41, 42, 43, 44, 45, 46],
    season: 'summer',
    stock: true,
    image: 'Nike Victori One Slides.jpg',
    blurb: 'Слайди з м’якою піною для відпочинку після тренування.',
    rank: 6,
  },
  {
    id: 'adidas-superstar',
    title: 'Superstar',
    brand: 'Adidas',
    price: 4100,
    gender: 'unisex',
    category: 'sneakers',
    color: 'white',
    sizes: [36, 37, 38, 39, 40, 41, 42, 43, 44, 45],
    season: 'spring',
    badge: 'Хіт',
    stock: true,
    image: 'Adidas Superstar shoes pair.jpg',
    blurb: 'Легендарний носок-мушля і три смужки.',
    rank: 7,
  },
  {
    id: 'adidas-stan-smith',
    title: 'Stan Smith',
    brand: 'Adidas',
    price: 3900,
    compareAt: 4400,
    gender: 'women',
    category: 'sneakers',
    color: 'white',
    sizes: [36, 37, 38, 39, 40, 41],
    season: 'spring',
    stock: true,
    image: 'Adidas Stan Smith wht-blk.jpg',
    blurb: 'Чистий шкіряний верх без зайвого декору.',
    rank: 8,
  },
  {
    id: 'adidas-samba',
    title: 'Samba OG',
    brand: 'Adidas',
    price: 4500,
    gender: 'men',
    category: 'sneakers',
    color: 'black',
    sizes: [40, 41, 42, 43, 44, 45, 46],
    season: 'autumn',
    badge: 'Новинка',
    stock: true,
    image: 'Adidas samba black.jpg',
    blurb: 'Футзальна класика із замшевим носком і гумовою підошвою.',
    rank: 9,
  },
  {
    id: 'adidas-adilette',
    title: 'Adilette 22',
    brand: 'Adidas',
    price: 1900,
    gender: 'women',
    category: 'slides',
    color: 'white',
    sizes: [36, 37, 38, 39, 40, 41],
    season: 'summer',
    stock: true,
    image: 'Adidas Adilette 22.jpg',
    blurb: 'Слайди з формованою підошвою для басейну й дому.',
    rank: 10,
  },
  {
    id: 'adidas-superstar-kids',
    title: 'Superstar Kids',
    brand: 'Adidas',
    price: 2300,
    gender: 'kids',
    category: 'sneakers',
    color: 'white',
    sizes: [28, 29, 30, 31, 32, 33, 34, 35],
    season: 'spring',
    stock: true,
    image: 'Adidas Superstar shoes pair.jpg',
    blurb: 'Дитяча версія класики з міцним носком.',
    rank: 11,
  },
  {
    id: 'new-balance-574',
    title: '574',
    brand: 'New Balance',
    price: 4200,
    gender: 'unisex',
    category: 'sneakers',
    color: 'grey',
    sizes: [37, 38, 39, 40, 41, 42, 43, 44, 45],
    season: 'autumn',
    badge: 'Хіт',
    stock: true,
    image: 'New Balance 574.jpg',
    blurb: 'Замшево-сітчастий верх і амортизація ENCAP.',
    rank: 12,
  },
  {
    id: 'asics-gel-lyte-iii',
    title: 'Gel-Lyte III',
    brand: 'ASICS',
    price: 4900,
    compareAt: 5400,
    gender: 'men',
    category: 'sport',
    color: 'white',
    sizes: [40, 41, 42, 43, 44, 45, 46],
    season: 'spring',
    stock: true,
    image: "ASICS x Afew Gel Lyte III 'Koi'.jpg",
    blurb: 'Розрізаний язичок і м’яка подушка GEL.',
    rank: 13,
  },
  {
    id: 'jordan-air-jordan-1',
    title: 'Air Jordan 1',
    brand: 'Jordan',
    price: 8000,
    gender: 'men',
    category: 'sneakers',
    color: 'black',
    sizes: [40, 41, 42, 43, 44, 45, 46],
    season: 'winter',
    stock: true,
    image: 'Air Jordan 1 Banned.jpg',
    blurb: 'Високий баскетбольний силует, з якого все почалося.',
    rank: 14,
  },
  {
    id: 'converse-chuck-taylor',
    title: 'Chuck Taylor All Star Kids',
    brand: 'Converse',
    price: 1890,
    gender: 'kids',
    category: 'sneakers',
    color: 'blue',
    sizes: [28, 29, 30, 31, 32, 33, 34, 35],
    season: 'spring',
    stock: true,
    image: 'Red and blue Chuck Taylor All-Stars sneakers, 2010.jpg',
    blurb: 'Текстильні кеди з гумовим носком.',
    rank: 15,
  },
  {
    id: 'dr-martens-1460',
    title: '1460',
    brand: 'Dr. Martens',
    price: 7200,
    gender: 'unisex',
    category: 'boots',
    color: 'black',
    sizes: [37, 38, 39, 40, 41, 42, 43, 44, 45],
    season: 'winter',
    stock: true,
    image: 'Dr Martens 10 Eyelet Boots.JPG',
    blurb: 'Черевики з жовтим швом і підошвою AirWair.',
    rank: 16,
  },
  {
    id: 'puma-suede',
    title: 'Suede Classic',
    brand: 'Puma',
    price: 3300,
    gender: 'unisex',
    category: 'sneakers',
    color: 'black',
    sizes: [36, 37, 38, 39, 40, 41],
    season: 'spring',
    stock: true,
    image: 'Puma Suede.jpg',
    blurb: 'Замшевий верх і форм-смуга. Міська класика.',
    rank: 17,
  },
  {
    id: 'timberland-6-inch',
    title: 'Splitrock Work Boot',
    brand: 'Timberland',
    price: 7600,
    compareAt: 8200,
    gender: 'men',
    category: 'boots',
    color: 'sand',
    sizes: [40, 41, 42, 43, 44, 45, 46],
    season: 'winter',
    stock: true,
    image: 'Timberland Pro Splitrock work boots.jpg',
    blurb: 'Водонепроникна шкіра й утеплена вставка.',
    rank: 18,
  },
];

export const EMPTY_FILTERS: Filters = {
  q: '',
  brand: '',
  gender: '',
  category: '',
  color: '',
  size: '',
  season: '',
  min: 0,
  max: PRICE_CEILING,
  sort: 'popular',
  page: 1,
};

export function productById(id: string): Product | undefined {
  return PRODUCTS.find((product) => product.id === id);
}

export function imageUrl(product: Product, width = 640): string {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(product.image)}?width=${width}`;
}

export function colorHex(id: string): string {
  return COLORS.find((color) => color.id === id)?.hex ?? '#dddddd';
}

export function formatMoney(value: number): string {
  return `${new Intl.NumberFormat('uk-UA').format(value)} ₴`;
}

export function parseFilters(params: URLSearchParams): Filters {
  const sort = params.get('sort');
  const page = Number(params.get('page') ?? '1');
  const min = Number(params.get('min') ?? '0');
  const max = Number(params.get('max') ?? String(PRICE_CEILING));
  return {
    q: params.get('q') ?? '',
    brand: params.get('brand') ?? '',
    gender: params.get('gender') ?? '',
    category: params.get('category') ?? '',
    color: params.get('color') ?? '',
    size: params.get('size') ?? '',
    season: params.get('season') ?? '',
    min: Number.isFinite(min) ? Math.max(0, min) : 0,
    max: Number.isFinite(max) ? Math.min(PRICE_CEILING, max) : PRICE_CEILING,
    sort: sort === 'price-asc' || sort === 'price-desc' || sort === 'new' ? sort : 'popular',
    page: Number.isFinite(page) && page > 0 ? Math.floor(page) : 1,
  };
}

export function filtersToQuery(filters: Filters): string {
  const params = new URLSearchParams();
  const entries: [keyof Filters, string][] = [
    ['q', filters.q.trim()],
    ['brand', filters.brand],
    ['gender', filters.gender],
    ['category', filters.category],
    ['color', filters.color],
    ['size', filters.size],
    ['season', filters.season],
  ];
  for (const [key, value] of entries) {
    if (value) params.set(key, value);
  }
  if (filters.min > 0) params.set('min', String(filters.min));
  if (filters.max < PRICE_CEILING) params.set('max', String(filters.max));
  if (filters.sort !== 'popular') params.set('sort', filters.sort);
  if (filters.page > 1) params.set('page', String(filters.page));
  const query = params.toString();
  return query ? `?${query}` : '';
}

function matchesGender(product: Product, gender: string): boolean {
  if (!gender) return true;
  if (gender === 'kids') return product.gender === 'kids';
  if (gender === 'women') return product.gender === 'women' || product.gender === 'unisex';
  if (gender === 'men') return product.gender === 'men' || product.gender === 'unisex';
  return product.gender === gender;
}

/** Apply every active filter and the selected sort. Paging is separate. */
export function matchProducts(products: readonly Product[], filters: Filters): Product[] {
  const query = filters.q.trim().toLowerCase();
  const size = Number(filters.size);
  const matched = products.filter((product) => {
    if (query) {
      const haystack = `${product.brand} ${product.title}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    if (filters.brand && product.brand !== filters.brand) return false;
    if (!matchesGender(product, filters.gender)) return false;
    if (filters.category && product.category !== filters.category) return false;
    if (filters.color && product.color !== filters.color) return false;
    if (filters.season && product.season !== filters.season) return false;
    if (filters.size && !product.sizes.includes(size)) return false;
    if (product.price < filters.min || product.price > filters.max) return false;
    return true;
  });

  const sorted = [...matched];
  if (filters.sort === 'price-asc') sorted.sort((a, b) => a.price - b.price);
  if (filters.sort === 'price-desc') sorted.sort((a, b) => b.price - a.price);
  if (filters.sort === 'new') sorted.sort((a, b) => b.rank - a.rank);
  if (filters.sort === 'popular') sorted.sort((a, b) => a.rank - b.rank);
  return sorted;
}

export function pageCount(total: number, pageSize = PAGE_SIZE): number {
  return Math.max(1, Math.ceil(total / pageSize));
}

export function pageOf(
  products: readonly Product[],
  page: number,
  pageSize = PAGE_SIZE,
): Product[] {
  const safe = Math.min(Math.max(1, page), pageCount(products.length, pageSize));
  const start = (safe - 1) * pageSize;
  return products.slice(start, start + pageSize);
}
