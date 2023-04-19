import solid from 'solid-start/vite';
import {defineConfig} from 'vite';
import staticAdapter from 'solid-start-static';

const config = defineConfig({
    base: '/maplibre-style-spec/',
    plugins: [solid({ssr: true, solid: {hydratable: true}, adapter: staticAdapter()})],
});

export default config;
