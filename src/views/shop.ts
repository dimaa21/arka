import { bindCards, productCard } from '../cards';
import {
  BRANDS,
  COLORS,
  EMPTY_FILTERS,
  filtersToQuery,
  matchProducts,
  pageCount,
  pageOf,
  parseFilters,
  PRICE_CEILING,
  products,
  type Filters,
  type SortId,
} from '../catalog';
import { siteUrl } from '../url';

const SIZES = [28, 29, 30, 31, 32, 33, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45];

/** Homepage: filters on the left, product grid on the right. */
export function renderShop(main: HTMLElement): void {
  let filters = parseFilters(new URLSearchParams(window.location.search));
  bindCards(main);

  const draw = (): void => {
    const matched = matchProducts(products(), filters);
    const pages = pageCount(matched.length);
    if (filters.page > pages) filters = { ...filters, page: pages };
    const visible = pageOf(matched, filters.page);
    main.innerHTML = `
      <div class="wrap shop">
        <aside class="filters" aria-label="Фільтрація товару">
          <div class="filter-head">
            <h2>Фільтрація товару</h2>
            <button type="button" data-reset>Скинути</button>
          </div>
          <label class="range-label">Ціновий діапазон
            <span>${filters.min} – ${filters.max} ₴</span>
          </label>
          <div class="range-row">
            <input data-min type="number" min="0" max="${PRICE_CEILING}" step="100" value="${filters.min}" aria-label="Ціна від" />
            <input data-max type="range" min="0" max="${PRICE_CEILING}" step="100" value="${filters.max}" aria-label="Ціна до" />
          </div>
          ${group('Колір', colorButtons(filters))}
          ${group('Розмір', sizeButtons(filters))}
          ${group(
            'Стать',
            choiceButtons(filters, 'gender', [
              ['women', 'Жінкам'],
              ['men', 'Чоловікам'],
              ['kids', 'Дітям'],
            ]),
          )}
          ${group(
            'Категорія',
            choiceButtons(filters, 'category', [
              ['sneakers', 'Кросівки'],
              ['sport', 'Спорт'],
              ['slides', 'Слайди'],
              ['boots', 'Черевики'],
            ]),
          )}
          ${group(
            'Сезон',
            choiceButtons(filters, 'season', [
              ['spring', 'Весна'],
              ['summer', 'Літо'],
              ['autumn', 'Осінь'],
              ['winter', 'Зима'],
            ]),
          )}
          ${group(
            'Бренд',
            choiceButtons(
              filters,
              'brand',
              BRANDS.map((brand) => [brand, brand]),
            ),
          )}
        </aside>
        <section>
          <div class="shop-head">
            <div>
              <h1>ARKA</h1>
              <p>${matched.length} ${pairsLabel(matched.length)}</p>
            </div>
            <label>Сортувати
              <select data-sort>
                ${sortOption(filters, 'popular', 'Популярні')}
                ${sortOption(filters, 'new', 'Нові')}
                ${sortOption(filters, 'price-asc', 'Спочатку дешевші')}
                ${sortOption(filters, 'price-desc', 'Спочатку дорожчі')}
              </select>
            </label>
          </div>
          ${
            visible.length
              ? `<div class="grid">${visible.map(productCard).join('')}</div>`
              : '<p class="empty">За цими фільтрами нічого немає. Скиньте частину умов.</p>'
          }
          ${pager(filters.page, pages)}
          <article class="seo">
            <p>ARKA збирає повсякденне взуття: міські кросівки, спорт, слайди й черевики. Тут моделі Nike, Adidas, New Balance та інших світових брендів, ціни вказані в гривнях.</p>
            <h2>З чого почати вибір</h2>
            <p class="seo-more" hidden>Спочатку оберіть розмір і сезон, потім звузьте колір. Жіночий і чоловічий розділи також показують унісекс. Дитячі пари зібрані окремо, зі своїми розмірами.</p>
            <button type="button" data-more>Показати більше</button>
          </article>
        </section>
      </div>`;

    main.querySelector('[data-reset]')?.addEventListener('click', () => {
      commit({ ...EMPTY_FILTERS });
    });
    main.querySelector('[data-sort]')?.addEventListener('change', (event) => {
      const value = (event.target as HTMLSelectElement).value;
      if (
        value === 'popular' ||
        value === 'new' ||
        value === 'price-asc' ||
        value === 'price-desc'
      ) {
        commit({ ...filters, sort: value, page: 1 });
      }
    });
    main.querySelector('[data-min]')?.addEventListener('change', (event) => {
      const min = clamp((event.target as HTMLInputElement).valueAsNumber, 0, filters.max);
      commit({ ...filters, min, page: 1 });
    });
    main.querySelector('[data-max]')?.addEventListener('change', (event) => {
      const max = clamp(
        (event.target as HTMLInputElement).valueAsNumber,
        filters.min,
        PRICE_CEILING,
      );
      commit({ ...filters, max, page: 1 });
    });
    main.querySelectorAll<HTMLButtonElement>('[data-key]').forEach((button) => {
      button.addEventListener('click', () => {
        const key = button.dataset.key;
        const value = button.dataset.value ?? '';
        if (!isFilterKey(key)) return;
        const current = filters[key];
        commit({ ...filters, [key]: current === value ? '' : value, page: 1 });
      });
    });
    main.querySelectorAll<HTMLButtonElement>('[data-page]').forEach((button) => {
      button.addEventListener('click', () => {
        commit({ ...filters, page: Number(button.dataset.page) });
        main.scrollIntoView({ block: 'start' });
      });
    });
    const more = main.querySelector('[data-more]');
    const extra = main.querySelector('.seo-more');
    more?.addEventListener('click', () => {
      if (!(extra instanceof HTMLElement) || !(more instanceof HTMLButtonElement)) return;
      const open = extra.hasAttribute('hidden');
      extra.toggleAttribute('hidden', !open);
      more.textContent = open ? 'Згорнути' : 'Показати більше';
    });
  };

  const commit = (next: Filters): void => {
    filters = next;
    const query = filtersToQuery(filters);
    history.replaceState(null, '', `${siteUrl()}${query}`);
    draw();
  };

  draw();
}

function group(title: string, body: string): string {
  return `<fieldset><legend>${title}</legend>${body}</fieldset>`;
}

function colorButtons(filters: Filters): string {
  return `<div class="swatches">${COLORS.map((color) => {
    const on = filters.color === color.id ? ' is-on' : '';
    return `<button type="button" class="swatch${on}" data-key="color" data-value="${color.id}" style="--swatch:${color.hex}" aria-label="${color.label}" aria-pressed="${on ? 'true' : 'false'}"></button>`;
  }).join('')}</div>`;
}

function sizeButtons(filters: Filters): string {
  return `<div class="sizes">${SIZES.map((size) => {
    const on = filters.size === String(size) ? ' is-on' : '';
    return `<button type="button" class="size${on}" data-key="size" data-value="${size}" aria-pressed="${on ? 'true' : 'false'}">${size}</button>`;
  }).join('')}</div>`;
}

function choiceButtons(
  filters: Filters,
  key: FilterKey,
  options: readonly (readonly [string, string])[],
): string {
  return `<div class="choices">${options
    .map(([value, label]) => {
      const on = filters[key] === value ? ' is-on' : '';
      return `<button type="button" class="choice${on}" data-key="${key}" data-value="${value}" aria-pressed="${on ? 'true' : 'false'}">${label}</button>`;
    })
    .join('')}</div>`;
}

type FilterKey = 'brand' | 'gender' | 'category' | 'color' | 'size' | 'season';

function isFilterKey(value: string | undefined): value is FilterKey {
  return (
    value === 'brand' ||
    value === 'gender' ||
    value === 'category' ||
    value === 'color' ||
    value === 'size' ||
    value === 'season'
  );
}

function sortOption(filters: Filters, value: SortId, label: string): string {
  const selected = filters.sort === value ? ' selected' : '';
  return `<option value="${value}"${selected}>${label}</option>`;
}

function pager(page: number, pages: number): string {
  if (pages < 2) return '';
  const buttons = Array.from({ length: pages }, (_, index) => {
    const number = index + 1;
    const current = number === page ? ' aria-current="page"' : '';
    return `<button type="button" data-page="${number}"${current}>${number}</button>`;
  }).join('');
  const next =
    page < pages
      ? `<button type="button" data-page="${page + 1}" aria-label="Наступна">→</button>`
      : '';
  return `<nav class="pager" aria-label="Сторінки">${buttons}${next}</nav>`;
}

function pairsLabel(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return 'пара';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'пари';
  return 'пар';
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}
