import { loadCatalog } from './api';
import { boot } from './chrome';

/** Paint the chrome, then fill the page once the catalog request settles. */
export function start(render: (main: HTMLElement) => void): void {
  const main = boot();
  void loadCatalog().finally(() => {
    render(main);
  });
}
