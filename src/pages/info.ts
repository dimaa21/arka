import '../style.css';
import { start } from '../start';
import { renderInfo } from '../views/info';

start((main) => {
  renderInfo(main, document.body.dataset.info ?? 'about');
});
