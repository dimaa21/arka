import { bindCards, productCard } from '../cards';
import { siteUrl } from '../url';
import { wishedProducts } from '../store';

export function renderSaved(main: HTMLElement): void {
  const draw = (): void => {
    const products = wishedProducts();
    main.innerHTML =
      products.length === 0
        ? `<section class="wrap page-copy"><h1>Збережене</h1><p>Сердечко на картці лишає пару тут.</p><a class="btn" href="${siteUrl()}">До каталогу</a></section>`
        : `<section class="wrap products-block"><h1>Збережене</h1><div class="grid">${products.map(productCard).join('')}</div></section>`;
  };
  bindCards(main);
  document.addEventListener('arka-store', draw);
  draw();
}
