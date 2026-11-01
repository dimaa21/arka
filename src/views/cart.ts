import { formatMoney, productById } from '../catalog';
import { cartLines, clearCart, setQty } from '../store';
import { siteUrl } from '../url';

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
            <button class="btn" type="button" data-clear>Очистити</button>
            <p class="form-note">Це вітрина магазину: оплата тут не списується.</p>
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
  };
  draw();
}
