import { placeOrder } from '../api';
import { formatMoney, productById } from '../catalog';
import { cartLines, clearCart, setQty } from '../store';
import { siteUrl } from '../url';

function fieldText(value: FormDataEntryValue | null): string {
  return typeof value === 'string' ? value.trim() : '';
}

function escapeText(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    if (char === '&') return '&amp;';
    if (char === '<') return '&lt;';
    if (char === '>') return '&gt;';
    if (char === '"') return '&quot;';
    return '&#39;';
  });
}

export function renderCart(main: HTMLElement): void {
  const draw = (): void => {
    const lines = cartLines().flatMap((line) => {
      const product = productById(line.id);
      return product ? [{ ...line, product }] : [];
    });
    const total = lines.reduce((sum, line) => sum + line.product.price * line.qty, 0);
    main.innerHTML =
      lines.length === 0
        ? `<section class="wrap page-copy"><h1>Кошик порожній</h1><p>Оберіть пару в каталозі.</p><a class="btn" href="${siteUrl()}">До каталогу</a></section>`
        : `<section class="wrap page-copy">
            <h1>Кошик</h1>
            <ul class="lines">
              ${lines
                .map(
                  (line) => `<li>
                    <a href="${siteUrl(`product/?id=${line.product.id}`)}">${line.product.brand} ${line.product.title}</a>
                    <span>розмір ${line.size}</span>
                    <span>${formatMoney(line.product.price)}</span>
                    <label>Кількість
                      <input data-id="${line.id}" data-size="${line.size}" type="number" min="0" max="5" value="${line.qty}" />
                    </label>
                  </li>`,
                )
                .join('')}
            </ul>
            <p class="total">Разом ${formatMoney(total)}</p>
            <form class="stack-form checkout" data-checkout>
              <label>Ім’я<input name="name" required autocomplete="name" /></label>
              <label>Телефон<input name="phone" required autocomplete="tel" placeholder="+380" /></label>
              <label>Місто<input name="city" required autocomplete="address-level2" /></label>
              <label>Доставка
                <select name="delivery">
                  <option value="branch">Відділення</option>
                  <option value="courier">Кур’єр</option>
                </select>
              </label>
              <label>Адреса або відділення<input name="address" required /></label>
              <label>Оплата
                <select name="payment">
                  <option value="cod">Післяплата</option>
                  <option value="card">Картка при отриманні реквізитів</option>
                </select>
              </label>
              <label>Промокод<input name="promo" placeholder="ARKA10 або WELCOME" autocomplete="off" /></label>
              <button class="btn" type="submit">Оформити замовлення</button>
              <button class="btn" type="button" data-clear>Очистити</button>
              <p class="form-note" role="status">Оплата тут не списується. Замовлення зберігає сервер магазину. ARKA10 дає −10%, WELCOME — −300 ₴ від 2000 ₴.</p>
            </form>
          </section>`;

    main.querySelectorAll<HTMLInputElement>('input[data-id]').forEach((input) => {
      input.addEventListener('change', () => {
        const id = input.dataset.id;
        const size = Number(input.dataset.size);
        if (!id) return;
        setQty(id, size, input.valueAsNumber);
        draw();
      });
    });
    main.querySelector('[data-clear]')?.addEventListener('click', () => {
      clearCart();
      draw();
    });
    const form = main.querySelector('[data-checkout]');
    form?.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!(form instanceof HTMLFormElement)) return;
      const data = new FormData(form);
      const note = form.querySelector('.form-note');
      const name = fieldText(data.get('name'));
      const phone = fieldText(data.get('phone'));
      const city = fieldText(data.get('city'));
      const address = fieldText(data.get('address'));
      const delivery = data.get('delivery') === 'courier' ? 'courier' : 'branch';
      const payment = data.get('payment') === 'card' ? 'card' : 'cod';
      const promo = fieldText(data.get('promo'));
      const items = lines.map((line) => ({ id: line.id, size: line.size, qty: line.qty }));
      if (note) note.textContent = 'Зберігаємо замовлення…';
      void placeOrder({ name, phone, city, delivery, address, payment, promo, items }).then(
        (result) => {
          if (!result.ok) {
            if (note) note.textContent = result.message;
            return;
          }
          clearCart();
          const saved = result.order;
          const discount = saved.discount > 0 ? `<p>Знижка ${formatMoney(saved.discount)}</p>` : '';
          main.innerHTML = `<section class="wrap page-copy order-done">
            <h1>Замовлення ${escapeText(saved.number)}</h1>
            <p>${escapeText(name)}, дякуємо. Сума ${formatMoney(saved.total)}.</p>
            ${discount}
            <p>Доставка: ${escapeText(city)}, ${escapeText(address)}. Оплата на сайті не списується.</p>
            <a class="btn" href="${siteUrl()}">До каталогу</a>
          </section>`;
        },
      );
    });
  };
  draw();
}
