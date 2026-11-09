import { bindCards, productCard } from '../cards';
import { BRANDS, EMPTY_FILTERS, imageUrl, matchProducts, PRODUCTS } from '../catalog';
import { siteUrl } from '../url';

interface LandingCopy {
  readonly kicker: string;
  readonly title: string;
  readonly text: string;
  readonly gender: string;
  readonly category: string;
}

const COPY: Record<string, LandingCopy> = {
  women: {
    kicker: 'Жінкам',
    title: 'Легкі пари на кожен день',
    text: 'Кеди, слайди і спокійні кольори. Унісекс теж у цій добірці.',
    gender: 'women',
    category: '',
  },
  men: {
    kicker: 'Чоловікам',
    title: 'Щільний верх і чистий силует',
    text: 'Міські кросівки, спорт і черевики. Розміри від 40.',
    gender: 'men',
    category: '',
  },
  kids: {
    kicker: 'Дітям',
    title: 'Пари, які дитина взує сама',
    text: 'Липучки, м’який задник і окрема сітка розмірів.',
    gender: 'kids',
    category: '',
  },
  sport: {
    kicker: 'Спорт',
    title: 'Зал, вулиця, довга зміна',
    text: 'Легші колодки з сіткою і стабільною п’ятою.',
    gender: '',
    category: 'sport',
  },
  brands: {
    kicker: 'Бренди',
    title: 'Світові бренди в одному магазині',
    text: 'Nike, Adidas, New Balance, Jordan, ASICS, Converse, Puma, Dr. Martens і Timberland. Одна доставка.',
    gender: '',
    category: '',
  },
};

/** Inner pages: hero, promo cards, categories, a product row, questions. */
export function renderLanding(main: HTMLElement, key: string): void {
  const copy = COPY[key] ?? COPY.brands;
  if (!copy) return;
  const picks = matchProducts(PRODUCTS, {
    ...EMPTY_FILTERS,
    gender: copy.gender,
    category: copy.category,
  }).slice(0, 4);
  const allHref = siteUrl(catalogHref(copy));

  main.innerHTML = `
    <section class="hero">
      <div class="wrap hero-grid">
        <div>
          <p class="kicker">${copy.kicker}</p>
          <h1>${copy.title}</h1>
          <p>${copy.text}</p>
          <a class="btn" href="${allHref}">Дивитись пари</a>
        </div>
        <div class="hero-art" aria-hidden="true">${picks[0] ? `<img src="${imageUrl(picks[0], 900)}" alt="" decoding="async" />` : ''}</div>
      </div>
    </section>
    <section class="wrap promos" aria-label="Добірки">
      ${promo('Нова колодка', 'М’яка устілка на цілий день', 'light')}
      ${promo('Дроп сезону', 'Осінні кольори вже на складі', 'brown')}
      ${promo('Зручна оплата', 'Картка або післяплата', 'red')}
      ${promo('Класика міста', 'Білі та чорні пари без шуму', 'green')}
    </section>
    <section class="wrap brands-row" aria-label="Лінії">
      <h2>Наші бренди</h2>
      <div>${BRANDS.map((brand) => `<a href="${siteUrl(`?brand=${encodeURIComponent(brand)}`)}">${brand}</a>`).join('')}</div>
    </section>
    <section class="wrap">
      <h2>Оберіть свій розділ</h2>
      <div class="cats">
        ${cat('women/', 'Жінкам', 'Міські кеди')}
        ${cat('men/', 'Чоловікам', 'Щільний верх')}
        ${cat('kids/', 'Дітям', 'Липучки і легка підошва')}
        ${cat('sport/', 'Спорт', 'Зал і вулиця')}
      </div>
    </section>
    <section class="wrap products-block">
      <div class="block-head">
        <h2>Пари з цього розділу</h2>
        <a href="${allHref}">Усі</a>
      </div>
      <div class="grid">${picks.map(productCard).join('')}</div>
    </section>
    <section class="wrap faq" aria-label="Питання">
      <h2>Питання</h2>
      ${qa('Як підібрати розмір?', 'У картці товару вказані довжини, які ми міряли по устілці. Якщо ви між розмірами, беріть більший.')}
      ${qa('Скільки їде доставка?', 'По Україні відправляємо наступного робочого дня. У місті можна забрати самовивозом.')}
      ${qa('Чи можна повернути?', 'Так, протягом 14 днів, якщо пара не ношена і збережена коробка.')}
      ${qa('Як оплатити?', 'Картка онлайн або післяплата у відділенні.')}
    </section>
    <section class="newsletter">
      <div class="wrap news-grid">
        <div>
          <h2>Лист про нові пари</h2>
          <p>Коротко, без щоденної розсилки. Адреса лишається у вашому браузері.</p>
        </div>
        <form data-news>
          <label class="sr-only" for="news-email">Електронна пошта</label>
          <input id="news-email" name="email" type="email" required placeholder="you@email.com" />
          <button class="btn" type="submit">Надіслати</button>
          <p class="form-note" role="status"></p>
        </form>
      </div>
    </section>`;

  bindCards(main);
  const form = main.querySelector('[data-news]');
  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!(form instanceof HTMLFormElement)) return;
    const note = form.querySelector('.form-note');
    const email = new FormData(form).get('email');
    if (typeof email !== 'string' || !email.includes('@')) {
      if (note) note.textContent = 'Вкажіть адресу з @.';
      return;
    }
    localStorage.setItem('arka.news', email.trim());
    form.reset();
    if (note) note.textContent = 'Записали. Напишемо, коли вийде нова пара.';
  });
}

function catalogHref(copy: LandingCopy): string {
  const params = new URLSearchParams();
  if (copy.gender) params.set('gender', copy.gender);
  if (copy.category) params.set('category', copy.category);
  const query = params.toString();
  return query ? `?${query}` : '';
}

function promo(title: string, text: string, tone: string): string {
  return `<article class="promo tone-${tone}"><h3>${title}</h3><p>${text}</p></article>`;
}

function cat(href: string, title: string, text: string): string {
  return `<a class="cat" href="${siteUrl(href)}"><span>${title}</span><small>${text}</small></a>`;
}

function qa(question: string, answer: string): string {
  return `<details><summary>${question}</summary><p>${answer}</p></details>`;
}
