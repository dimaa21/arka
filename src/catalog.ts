export type Gender = 'women' | 'men' | 'kids' | 'unisex';
export type Category = 'sneakers' | 'slides' | 'boots' | 'sport';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type ShoeVariant = 'runner' | 'court' | 'slide' | 'boot';
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
  readonly variant: ShoeVariant;
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

export const BRANDS = ['VELA', 'NORD', 'KITE', 'MIRA', 'SABLE', 'LUMEN', 'FELD', 'ORI'] as const;

export const PRODUCTS: readonly Product[] = [
  {
    id: 'vela-court',
    title: 'Court Soft',
    brand: 'VELA',
    price: 2580,
    gender: 'women',
    category: 'sneakers',
    color: 'white',
    sizes: [36, 37, 38, 39, 40, 41],
    season: 'spring',
    badge: 'Хіт',
    stock: true,
    variant: 'court',
    blurb: 'Низький силует, м’яка устілка і світла підошва на кожен день.',
    rank: 1,
  },
  {
    id: 'nord-block',
    title: 'Block Cord',
    brand: 'NORD',
    price: 3900,
    compareAt: 4500,
    gender: 'unisex',
    category: 'sneakers',
    color: 'black',
    sizes: [39, 40, 41, 42, 43, 44],
    season: 'autumn',
    badge: 'Хіт',
    stock: true,
    variant: 'runner',
    blurb: 'Щільний верх і широка підошва. Тримає форму в місті.',
    rank: 2,
  },
  {
    id: 'kite-field',
    title: 'Field Leather',
    brand: 'KITE',
    price: 4200,
    gender: 'men',
    category: 'sneakers',
    color: 'brown',
    sizes: [40, 41, 42, 43, 44, 45],
    season: 'autumn',
    stock: true,
    variant: 'runner',
    blurb: 'Шкіряний верх і спокійна коричнева палітра.',
    rank: 3,
  },
  {
    id: 'mira-chalk',
    title: 'Chalk Suede',
    brand: 'MIRA',
    price: 3100,
    gender: 'women',
    category: 'sneakers',
    color: 'sand',
    sizes: [36, 37, 38, 39, 40],
    season: 'spring',
    stock: true,
    variant: 'court',
    blurb: 'Замшевий верх і гумова підошва з легким протектором.',
    rank: 4,
  },
  {
    id: 'sable-space',
    title: 'Space Grey',
    brand: 'SABLE',
    price: 1850,
    gender: 'men',
    category: 'sport',
    color: 'grey',
    sizes: [41, 42, 43, 44, 45],
    season: 'summer',
    stock: true,
    variant: 'runner',
    blurb: 'Легка бігова колодка для зали і для вулиці.',
    rank: 5,
  },
  {
    id: 'lumen-crystal',
    title: 'Crystal White',
    brand: 'LUMEN',
    price: 1750,
    gender: 'women',
    category: 'sport',
    color: 'white',
    sizes: [36, 37, 38, 39, 40, 41],
    season: 'summer',
    stock: true,
    variant: 'runner',
    blurb: 'Світлий верх і м’який хід. Зручно на довгу зміну.',
    rank: 6,
  },
  {
    id: 'feld-gum',
    title: 'Green Gum',
    brand: 'FELD',
    price: 3200,
    gender: 'unisex',
    category: 'sneakers',
    color: 'green',
    sizes: [37, 38, 39, 40, 41, 42, 43],
    season: 'autumn',
    stock: true,
    variant: 'court',
    blurb: 'Зелений верх і підошва кольору жуйки.',
    rank: 7,
  },
  {
    id: 'ori-lux',
    title: 'Lux Black',
    brand: 'ORI',
    price: 2100,
    gender: 'men',
    category: 'sneakers',
    color: 'black',
    sizes: [40, 41, 42, 43, 44],
    season: 'winter',
    stock: true,
    variant: 'court',
    blurb: 'Гладка чорна шкіра без зайвого декору.',
    rank: 8,
  },
  {
    id: 'vela-slide',
    title: 'Day Slide',
    brand: 'VELA',
    price: 2200,
    gender: 'women',
    category: 'slides',
    color: 'white',
    sizes: [36, 37, 38, 39, 40],
    season: 'summer',
    stock: true,
    variant: 'slide',
    blurb: 'Один ремінець і м’яка устілка. Для тепла і для дому.',
    rank: 9,
  },
  {
    id: 'nord-ice',
    title: 'Ice Blue',
    brand: 'NORD',
    price: 3100,
    gender: 'women',
    category: 'sneakers',
    color: 'blue',
    sizes: [36, 37, 38, 39, 40, 41],
    season: 'spring',
    stock: true,
    variant: 'court',
    blurb: 'Холодний блакитний верх і чиста біла підошва.',
    rank: 10,
  },
  {
    id: 'kite-star',
    title: 'Star White',
    brand: 'KITE',
    price: 2900,
    gender: 'unisex',
    category: 'sneakers',
    color: 'white',
    sizes: [38, 39, 40, 41, 42, 43, 44],
    season: 'spring',
    badge: 'Хіт',
    stock: true,
    variant: 'court',
    blurb: 'Класичний білий кеди-силует, який носиться з чим завгодно.',
    rank: 11,
  },
  {
    id: 'mira-claw',
    title: 'Claw Green',
    brand: 'MIRA',
    price: 4650,
    compareAt: 5200,
    gender: 'men',
    category: 'sport',
    color: 'black',
    sizes: [41, 42, 43, 44, 45],
    season: 'winter',
    stock: true,
    variant: 'runner',
    blurb: 'Щільна сітка, зелені вставки і стабільна п’ята.',
    rank: 12,
  },
  {
    id: 'sable-kids',
    title: 'Kids Velcro',
    brand: 'SABLE',
    price: 1490,
    gender: 'kids',
    category: 'sneakers',
    color: 'navy',
    sizes: [28, 29, 30, 31, 32, 33],
    season: 'autumn',
    badge: 'Новинка',
    stock: true,
    variant: 'court',
    blurb: 'Липучка замість шнурків. Легко взувати самостійно.',
    rank: 13,
  },
  {
    id: 'lumen-kids',
    title: 'Kids Court',
    brand: 'LUMEN',
    price: 1390,
    gender: 'kids',
    category: 'sneakers',
    color: 'pink',
    sizes: [28, 29, 30, 31, 32],
    season: 'spring',
    stock: true,
    variant: 'court',
    blurb: 'М’який задник і світла підошва для дитячого розміру.',
    rank: 14,
  },
  {
    id: 'feld-boot',
    title: 'Rain Boot',
    brand: 'FELD',
    price: 5100,
    gender: 'unisex',
    category: 'boots',
    color: 'black',
    sizes: [38, 39, 40, 41, 42, 43, 44],
    season: 'winter',
    stock: true,
    variant: 'boot',
    blurb: 'Вищий берц і щільний верх на мокру погоду.',
    rank: 15,
  },
  {
    id: 'ori-slide',
    title: 'Summer Slide',
    brand: 'ORI',
    price: 980,
    gender: 'men',
    category: 'slides',
    color: 'sand',
    sizes: [41, 42, 43, 44, 45],
    season: 'summer',
    stock: false,
    variant: 'slide',
    blurb: 'Легкий слайд. Зараз цієї пари немає на складі.',
    rank: 16,
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
