import { productById, products, type Product } from './catalog';

const CART_KEY = 'arka.cart';
const WISH_KEY = 'arka.wish';

export interface CartLine {
  readonly id: string;
  readonly size: number;
  readonly qty: number;
}

function readList(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

function readCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((line) => {
      if (!line || typeof line !== 'object') return [];
      const record = line as { id?: unknown; size?: unknown; qty?: unknown };
      if (typeof record.id !== 'string') return [];
      const size = Number(record.size);
      const qty = Number(record.qty);
      if (!Number.isFinite(size) || !Number.isFinite(qty) || qty < 1) return [];
      return [{ id: record.id, size, qty: Math.min(5, Math.floor(qty)) }];
    });
  } catch {
    return [];
  }
}

function writeCart(lines: readonly CartLine[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(lines));
  document.dispatchEvent(new CustomEvent('arka-store'));
}

export function cartLines(): CartLine[] {
  return readCart();
}

export function cartCount(): number {
  return readCart().reduce((sum, line) => sum + line.qty, 0);
}

export function wishIds(): string[] {
  return readList(WISH_KEY).filter((id) => productById(id));
}

export function wishCount(): number {
  return wishIds().length;
}

export function isWished(id: string): boolean {
  return wishIds().includes(id);
}

export function toggleWish(id: string): boolean {
  const next = wishIds().filter((item) => item !== id);
  const added = next.length === wishIds().length;
  if (added) next.push(id);
  localStorage.setItem(WISH_KEY, JSON.stringify(next));
  document.dispatchEvent(new CustomEvent('arka-store'));
  return added;
}

export function addToCart(id: string, size: number): void {
  const lines = readCart();
  const existing = lines.find((line) => line.id === id && line.size === size);
  if (existing) {
    writeCart(
      lines.map((line) => (line === existing ? { ...line, qty: Math.min(5, line.qty + 1) } : line)),
    );
    return;
  }
  writeCart([...lines, { id, size, qty: 1 }]);
}

export function setQty(id: string, size: number, qty: number): void {
  const lines = readCart().flatMap((line) => {
    if (line.id !== id || line.size !== size) return [line];
    if (qty < 1) return [];
    return [{ ...line, qty: Math.min(5, qty) }];
  });
  writeCart(lines);
}

export function clearCart(): void {
  writeCart([]);
}

export function wishedProducts(): Product[] {
  const ids = new Set(wishIds());
  return products().filter((product) => ids.has(product.id));
}
