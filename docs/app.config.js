import {defineConfig} from '@solidjs/start/config';

const config = defineConfig({
    ssr: false,
    server: {
        preset: 'static',
        experimental: {
            asyncContext: true
        },
    }
});

export default config;
