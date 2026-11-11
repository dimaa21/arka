import { bindCards, productCard } from '../cards';
import { formatMoney, imageUrl, productById, products } from '../catalog';
import { addToCart } from '../store';
import { siteUrl } from '../url';

export function renderProduct(main: HTMLElement): void {
  const id = new URLSearchParams(window.location.search).get('id') ?? '';
  const product = productById(id);
  if (!product) {
    main.innerHTML = `<section class="wrap page-copy"><h1>Пару не знайдено</h1><a class="btn" href="${siteUrl()}">До каталогу</a></section>`;
    return;
  }
  const related = products()
    .filter((item) => item.id !== product.id && item.category === product.category)
    .slice(0, 4);
  main.innerHTML = `
    <article class="wrap product">
      <div class="photo photo-lg"><img src="${imageUrl(product, 900)}" alt="${product.brand} ${product.title}" decoding="async" /></div>
      <div>
        <p class="kicker">${product.brand}</p>
        <h1>${product.brand} ${product.title}</h1>
        <p class="price price-lg">${product.compareAt ? `<s>${formatMoney(product.compareAt)}</s> ` : ''}${formatMoney(product.price)}</p>
        <p>${product.blurb}</p>
        <p>${product.stock ? 'В наявності' : 'Немає в наявності'}</p>
        <form data-buy>
          <fieldset>
            <legend>Розмір</legend>
            <div class="sizes">
              ${product.sizes
                .map(
                  (size, index) =>
                    `<label class="size"><input type="radio" name="size" value="${size}" ${index === 0 ? 'checked' : ''} />${size}</label>`,
                )
                .join('')}
            </div>
          </fieldset>
          <button class="btn" type="submit" ${product.stock ? '' : 'disabled'}>Додати в кошик</button>
          <p class="form-note" role="status"></p>
        </form>
      </div>
    </article>
    <section class="wrap products-block">
      <h2>Поруч у каталозі</h2>
      <div class="grid">${related.map(productCard).join('')}</div>
    </section>`;
  bindCards(main);
  const form = main.querySelector('[data-buy]');
  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!(form instanceof HTMLFormElement) || !product.stock) return;
    const size = Number(new FormData(form).get('size'));
    if (!product.sizes.includes(size)) return;
    addToCart(product.id, size);
    const note = form.querySelector('.form-note');
    if (note) note.textContent = 'Додано в кошик.';
  });
}
