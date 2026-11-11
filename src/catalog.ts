import catalogData from '../data/products.json';

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

export const PRODUCTS: readonly Product[] = catalogData as readonly Product[];

let activeProducts: readonly Product[] = PRODUCTS;

/** Pairs currently shown in the shop. The API may replace the bundled list. */
export function products(): readonly Product[] {
  return activeProducts;
}

export function replaceProducts(next: readonly Product[]): void {
  if (next.length === 0) return;
  activeProducts = next;
}

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
  return activeProducts.find((product) => product.id === id);
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
