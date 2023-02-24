import Redirect from '../components/redirect';
import { prefixUrl } from '@mapbox/batfish/modules/prefix-url';

export default Redirect(() => prefixUrl(`/style-spec/${window.location.hash}`));
