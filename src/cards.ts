import { colorHex, formatMoney, type Product } from './catalog';
import { shoeMarkup } from './shoe';
import { isWished, toggleWish } from './store';
import { siteUrl } from './url';

export function productCard(product: Product): string {
  const price = product.compareAt
    ? `<span class="price"><s>${formatMoney(product.compareAt)}</s> ${formatMoney(product.price)}</span>`
    : `<span class="price">${formatMoney(product.price)}</span>`;
  const badge = product.badge ? `<span class="badge">${product.badge}</span>` : '';
  const stock = product.stock
    ? '<span class="stock">В наявності</span>'
    : '<span class="stock is-out">Немає в наявності</span>';
  const wished = isWished(product.id) ? ' is-on' : '';
  return `<article class="card">
    <a class="photo" href="${siteUrl(`product/?id=${product.id}`)}">
      ${badge}
      ${shoeMarkup(product.variant, colorHex(product.color))}
    </a>
    <button class="wish${wished}" type="button" data-wish="${product.id}" aria-label="Зберегти ${product.brand} ${product.title}" aria-pressed="${wished ? 'true' : 'false'}">${wished ? '♥' : '♡'}</button>
    <p class="brand">${product.brand}</p>
    <h3><a href="${siteUrl(`product/?id=${product.id}`)}">${product.brand} ${product.title}</a></h3>
    ${price}
    ${stock}
  </article>`;
}

export function bindCards(root: ParentNode): void {
  root.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const button = target.closest('[data-wish]');
    if (!(button instanceof HTMLButtonElement)) return;
    event.preventDefault();
    const id = button.dataset.wish;
    if (!id) return;
    const on = toggleWish(id);
    button.classList.toggle('is-on', on);
    button.setAttribute('aria-pressed', String(on));
    button.textContent = on ? '♥' : '♡';
  });
}
