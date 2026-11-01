import { describe, expect, it } from 'vitest';
import { EMPTY_FILTERS, matchProducts, pageCount, pageOf, parseFilters, PRODUCTS } from './catalog';

describe('matchProducts', () => {
  it('keeps the full catalog when nothing is selected', () => {
    expect(matchProducts(PRODUCTS, EMPTY_FILTERS)).toHaveLength(PRODUCTS.length);
  });

  it('filters by price, color, and a text query', () => {
    const found = matchProducts(PRODUCTS, {
      ...EMPTY_FILTERS,
      q: 'court',
      color: 'white',
      max: 3000,
    });
    expect(found.map((product) => product.id)).toEqual(['vela-court']);
  });

  it('includes unisex pairs in the women and men selections', () => {
    const women = matchProducts(PRODUCTS, { ...EMPTY_FILTERS, gender: 'women' });
    const kids = matchProducts(PRODUCTS, { ...EMPTY_FILTERS, gender: 'kids' });
    expect(women.some((product) => product.gender === 'unisex')).toBe(true);
    expect(kids.every((product) => product.gender === 'kids')).toBe(true);
  });

  it('sorts by price and pages nine at a time', () => {
    const sorted = matchProducts(PRODUCTS, { ...EMPTY_FILTERS, sort: 'price-asc' });
    expect(sorted[0]?.price).toBeLessThanOrEqual(sorted[1]?.price ?? 0);
    expect(pageOf(sorted, 1)).toHaveLength(9);
    expect(pageCount(sorted.length)).toBe(2);
    expect(pageOf(sorted, 2)).toHaveLength(sorted.length - 9);
  });
});

describe('parseFilters', () => {
  it('reads the query string and ignores an unknown sort', () => {
    const filters = parseFilters(new URLSearchParams('q=vela&sort=nope&page=2&max=4000'));
    expect(filters.q).toBe('vela');
    expect(filters.sort).toBe('popular');
    expect(filters.page).toBe(2);
    expect(filters.max).toBe(4000);
  });
});
