import { version } from '../../node_modules/maplibre-gl/package.json';
import { prefixUrl } from '@mapbox/batfish/modules/prefix-url';

function url(ext, options) {
    if (options && options.local && process.env.DEPLOY_ENV === 'local') {
        return prefixUrl(`/dist/maplibre-gl.${ext}`);
    } else {
        return `https://unpkg.com/maplibre-gl@${version}/dist/maplibre-gl.${ext}`;
    }
}

function js(options) {
    return url('js', options);
}

function css(options) {
    return url('css', options);
}

export default { js, css };
