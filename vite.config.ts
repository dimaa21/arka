import { defineConfig } from 'vitest/config';

/**
 * Project-page base. GitHub Pages will serve the built site at
 * `https://<user>.github.io/canvas-slot-machine/`.
 * Change this if the repository name differs.
 */
export default defineConfig({
  base: '/canvas-slot-machine/',
  build: {
    target: 'es2022',
    sourcemap: true,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
