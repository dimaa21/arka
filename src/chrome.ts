import { cartCount, wishCount } from './store';
import { currentSection, siteUrl } from './url';

const NAV = [
  { href: '', label: 'Каталог', match: '/' },
  { href: 'brands/', label: 'Бренди', match: '/brands/' },
  { href: 'sport/', label: 'Спорт', match: '/sport/' },
  { href: 'women/', label: 'Жінкам', match: '/women/' },
  { href: 'men/', label: 'Чоловікам', match: '/men/' },
  { href: 'kids/', label: 'Дітям', match: '/kids/' },
] as const;

/** Header, footer, and the page slot. */
export function boot(): HTMLElement {
  const app = document.querySelector('#app');
  if (!app) throw new Error('Missing #app');
  const section = currentSection();
  app.innerHTML = `${header(section)}<main id="content"></main>${footer()}`;
  const main = app.querySelector('#content');
  if (!(main instanceof HTMLElement)) throw new Error('Missing main');
  bindChrome(app);
  return main;
}

function header(section: string): string {
  const links = NAV.map((item) => {
    const current = section === item.match ? ' aria-current="page"' : '';
    return `<a href="${siteUrl(item.href)}"${current}>${item.label}</a>`;
  }).join('');
  return `<a class="skip" href="#content">До вмісту</a>
  <header class="top">
    <div class="bar">
      <a class="logo" href="${siteUrl()}">ARKA</a>
      <button class="menu" type="button" aria-expanded="false" aria-controls="site-nav">Меню</button>
      <nav id="site-nav" aria-label="Розділи">${links}</nav>
      <form class="search" action="${siteUrl()}" method="get" role="search">
        <label class="sr-only" for="q">Пошук</label>
        <input id="q" name="q" type="search" placeholder="Що шукаєте?" />
      </form>
      <a class="icon-link" href="${siteUrl('saved/')}" aria-label="Збережене">♡ <span data-count="wish">0</span></a>
      <a class="icon-link" href="${siteUrl('cart/')}" aria-label="Кошик">Сумка <span data-count="cart">0</span></a>
    </div>
  </header>
  <div class="ticker" aria-hidden="true">
    <div class="ticker-track">
      ${tickerChunk()}${tickerChunk()}
    </div>
  </div>`;
}

function tickerChunk(): string {
  const item =
    '<span>Осіння добірка</span><span class="pump">✦</span><span>Нові пари на складі</span><span class="pump">✦</span><span>Доставка по Україні</span><span class="pump">✦</span>';
  return item + item;
}

function footer(): string {
  return `<footer class="site-footer">
    <div class="wrap foot">
      <div>
        <p class="logo logo-foot">ARKA</p>
        <p>Взуття на кожен день. Івано-Франківськ, доставка по Україні.</p>
      </div>
      <div>
        <h2>Каталог</h2>
        <a href="${siteUrl()}">Усі пари</a>
        <a href="${siteUrl('women/')}">Жінкам</a>
        <a href="${siteUrl('men/')}">Чоловікам</a>
        <a href="${siteUrl('kids/')}">Дітям</a>
      </div>
      <div>
        <h2>Про нас</h2>
        <a href="${siteUrl('about/')}">Магазин</a>
        <a href="${siteUrl('delivery/')}">Доставка і оплата</a>
        <a href="${siteUrl('faq/')}">Питання</a>
      </div>
      <div>
        <h2>Покупцям</h2>
        <a href="${siteUrl('contacts/')}">Контакти</a>
        <a href="${siteUrl('cart/')}">Кошик</a>
        <a href="${siteUrl('saved/')}">Збережене</a>
      </div>
    </div>
    <p class="legal">© ${new Date().getFullYear()} ARKA. Фото: Wikimedia Commons, права належать авторам. Торгові марки належать їхнім власникам.</p>
  </footer>`;
}

function bindChrome(root: ParentNode): void {
  const refresh = (): void => {
    const wish = root.querySelector('[data-count="wish"]');
    const cart = root.querySelector('[data-count="cart"]');
    if (wish) wish.textContent = String(wishCount());
    if (cart) cart.textContent = String(cartCount());
  };
  refresh();
  document.addEventListener('arka-store', refresh);

  const menu = root.querySelector('.menu');
  const nav = root.querySelector('#site-nav');
  if (menu instanceof HTMLButtonElement && nav instanceof HTMLElement) {
    menu.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      menu.setAttribute('aria-expanded', String(open));
    });
  }
}
