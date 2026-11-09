import { siteUrl } from '../url';

function fieldText(value: FormDataEntryValue | null): string {
  return typeof value === 'string' ? value.trim() : '';
}

const PAGES: Record<string, { title: string; html: string }> = {
  about: {
    title: 'Магазин',
    html: `<p>ARKA — вітрина взуття з Івано-Франківська. Тут взуття Nike, Adidas, New Balance, Jordan, ASICS, Converse, Puma, Dr. Martens і Timberland, ціни в гривнях і доставка по Україні.</p>
      <p>Фотографії взято з Wikimedia Commons, права на них належать авторам. Назви брендів — торгові марки їхніх власників; ARKA не є офіційним партнером цих компаній.</p>`,
  },
  delivery: {
    title: 'Доставка і оплата',
    html: `<p>Відправляємо наступного робочого дня. Самовивіз у місті за домовленістю.</p>
      <p>Оплата карткою або післяплата. Повернення протягом 14 днів, якщо пара не ношена.</p>`,
  },
  contacts: {
    title: 'Контакти',
    html: `<p>Івано-Франківськ. Пишіть у форму, відповідь надійде на вашу адресу лише якщо ви її залишите в листі.</p>
      <form data-contact class="stack-form">
        <label>Ім’я<input name="name" required /></label>
        <label>Електронна пошта<input name="email" type="email" required /></label>
        <label>Повідомлення<textarea name="message" rows="5" required></textarea></label>
        <button class="btn" type="submit">Надіслати</button>
        <p class="form-note" role="status"></p>
      </form>`,
  },
  faq: {
    title: 'Питання',
    html: `<details open><summary>Як підібрати розмір?</summary><p>Дивіться сітку в картці. Між розмірами беріть більший.</p></details>
      <details><summary>Скільки їде доставка?</summary><p>Наступного робочого дня по Україні.</p></details>
      <details><summary>Чи можна повернути?</summary><p>14 днів, якщо пара не ношена.</p></details>`,
  },
};

export function renderInfo(main: HTMLElement, key: string): void {
  const page = PAGES[key] ?? PAGES.about;
  if (!page) return;
  main.innerHTML = `<section class="wrap page-copy"><p class="kicker"><a href="${siteUrl()}">ARKA</a></p><h1>${page.title}</h1>${page.html}</section>`;
  const form = main.querySelector('[data-contact]');
  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!(form instanceof HTMLFormElement)) return;
    const note = form.querySelector('.form-note');
    const data = new FormData(form);
    const email = fieldText(data.get('email'));
    const name = fieldText(data.get('name'));
    const message = fieldText(data.get('message'));
    if (!email.includes('@') || !name || !message) {
      if (note) note.textContent = 'Заповніть ім’я, адресу і текст.';
      return;
    }
    form.reset();
    if (note) note.textContent = 'Дякуємо. Це демонстраційна форма, лист нікуди не відправляється.';
  });
}
