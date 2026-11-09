import { defineConfig } from 'vitest/config';

/** GitHub Pages serves this repository at /arka/. */
export default defineConfig({
  base: '/arka/',
  appType: 'mpa',
  build: {
    target: 'es2022',
    sourcemap: true,
    rollupOptions: {
      input: {
        home: 'index.html',
        women: 'women/index.html',
        men: 'men/index.html',
        kids: 'kids/index.html',
        sport: 'sport/index.html',
        brands: 'brands/index.html',
        product: 'product/index.html',
        cart: 'cart/index.html',
        saved: 'saved/index.html',
        about: 'about/index.html',
        delivery: 'delivery/index.html',
        contacts: 'contacts/index.html',
        faq: 'faq/index.html',
      },
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
