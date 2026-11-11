import {
  replaceProducts,
  type Category,
  type ColorId,
  type Gender,
  type Product,
  type Season,
} from './catalog';

const GENDERS = new Set<Gender>(['women', 'men', 'kids', 'unisex']);
const CATEGORIES = new Set<Category>(['sneakers', 'slides', 'boots', 'sport']);
const COLORS = new Set<ColorId>([
  'white',
  'black',
  'brown',
  'green',
  'blue',
  'grey',
  'sand',
  'pink',
  'navy',
]);
const SEASONS = new Set<Season>(['spring', 'summer', 'autumn', 'winter']);

export interface OrderItem {
  readonly id: string;
  readonly size: number;
  readonly qty: number;
}

export interface OrderRequest {
  readonly name: string;
  readonly phone: string;
  readonly city: string;
  readonly delivery: 'branch' | 'courier';
  readonly address: string;
  readonly payment: 'card' | 'cod';
  readonly promo: string;
  readonly items: readonly OrderItem[];
}

export interface OrderResult {
  readonly number: string;
  readonly subtotal: number;
  readonly discount: number;
  readonly total: number;
  readonly promo: string | null;
}

export interface ContactRequest {
  readonly name: string;
  readonly email: string;
  readonly message: string;
}

function apiRoot(): string | null {
  const configured = import.meta.env.VITE_API_URL;
  if (typeof configured === 'string' && configured.trim()) return configured.replace(/\/$/, '');
  if (import.meta.env.DEV) return '';
  return null;
}

async function readBody(response: Response): Promise<Record<string, unknown>> {
  try {
    const body = (await response.json()) as unknown;
    return body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function parseProduct(value: unknown): Product | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const record = value as Record<string, unknown>;
  const gender = record.gender;
  const category = record.category;
  const color = record.color;
  const season = record.season;
  const sizes = Array.isArray(record.sizes)
    ? record.sizes.filter((size): size is number => typeof size === 'number')
    : [];
  if (typeof record.id !== 'string' || typeof record.title !== 'string') return undefined;
  if (typeof record.brand !== 'string' || typeof record.blurb !== 'string') return undefined;
  if (typeof record.image !== 'string' || typeof record.price !== 'number') return undefined;
  if (typeof record.rank !== 'number' || typeof record.stock !== 'boolean') return undefined;
  if (!GENDERS.has(gender as Gender) || !CATEGORIES.has(category as Category)) return undefined;
  if (!COLORS.has(color as ColorId) || !SEASONS.has(season as Season) || sizes.length === 0) {
    return undefined;
  }
  let product: Product = {
    id: record.id,
    title: record.title,
    brand: record.brand,
    price: record.price,
    gender: gender as Gender,
    category: category as Category,
    color: color as ColorId,
    sizes,
    season: season as Season,
    stock: record.stock,
    image: record.image,
    blurb: record.blurb,
    rank: record.rank,
  };
  if (typeof record.compareAt === 'number') product = { ...product, compareAt: record.compareAt };
  if (typeof record.badge === 'string' && record.badge)
    product = { ...product, badge: record.badge };
  return product;
}

/** Load the shop catalog from Laravel. The bundled list stays if the API is down. */
export async function loadCatalog(): Promise<void> {
  const root = apiRoot();
  if (root === null) return;
  try {
    const response = await fetch(`${root}/api/products`, { signal: AbortSignal.timeout(4000) });
    if (!response.ok) return;
    const body = await readBody(response);
    if (!Array.isArray(body.products)) return;
    const parsed = body.products.flatMap((item) => {
      const product = parseProduct(item);
      return product ? [product] : [];
    });
    replaceProducts(parsed);
  } catch {
    // The static catalog already rendered the storefront.
  }
}

export async function placeOrder(
  order: OrderRequest,
): Promise<{ ok: true; order: OrderResult } | { ok: false; message: string }> {
  const root = apiRoot();
  if (root === null) {
    return { ok: false, message: 'Сервер магазину не налаштований для цього сайту.' };
  }
  try {
    const response = await fetch(`${root}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(order),
    });
    const body = await readBody(response);
    if (!response.ok) {
      const message = typeof body.message === 'string' ? body.message : 'Замовлення не збережено.';
      return { ok: false, message };
    }
    if (typeof body.number !== 'string' || typeof body.total !== 'number') {
      return { ok: false, message: 'Сервер відповів без номера замовлення.' };
    }
    return {
      ok: true,
      order: {
        number: body.number,
        subtotal: typeof body.subtotal === 'number' ? body.subtotal : body.total,
        discount: typeof body.discount === 'number' ? body.discount : 0,
        total: body.total,
        promo: typeof body.promo === 'string' ? body.promo : null,
      },
    };
  } catch {
    return { ok: false, message: 'Сервер магазину зараз недоступний.' };
  }
}

export async function sendMessage(message: ContactRequest): Promise<boolean> {
  const root = apiRoot();
  if (root === null) return false;
  try {
    const response = await fetch(`${root}/api/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(message),
    });
    return response.ok;
  } catch {
    return false;
  }
}
