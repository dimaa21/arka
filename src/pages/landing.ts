import '../style.css';
import { start } from '../start';
import { renderLanding } from '../views/landing';

start((main) => {
  renderLanding(main, document.body.dataset.landing ?? 'brands');
});
