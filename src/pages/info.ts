import '../style.css';
import { boot } from '../chrome';
import { renderInfo } from '../views/info';

renderInfo(boot(), document.body.dataset.info ?? 'about');
