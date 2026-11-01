import '../style.css';
import { boot } from '../chrome';
import { renderLanding } from '../views/landing';

renderLanding(boot(), document.body.dataset.landing ?? 'brands');
