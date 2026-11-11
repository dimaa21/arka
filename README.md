# ARKA

A multi-page footwear store. The home page is a catalog with filters. The women, men, kids, sport and brands sections are separate storefronts.

The catalog features sneakers, slides and boots from Nike, Adidas, New Balance, Jordan, ASICS, Converse, Puma, Dr. Martens and Timberland. Product photos are loaded from Wikimedia Commons and remain the property of their authors under their respective licenses. All brand names are trademarks of their owners; this is a demo project and is not affiliated with any of them.

## Getting started

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173/arka/`.

The shop API is a Laravel app in `server/`. It serves the catalog, stores orders and contact messages in SQLite, and accepts the promo codes `ARKA10` (−10%) and `WELCOME` (−300 ₴ from 2 000 ₴). Start it before the storefront when you want checkout to be saved:

```bash
npm run api
```

The API listens on `http://127.0.0.1:8000`. Vite proxies `/api` to it during `npm run dev`. GitHub Pages still shows the bundled catalog, because Pages cannot run PHP. Payment is never charged.

```bash
npm test
npm run lint
npm run build
php server/artisan test
```
