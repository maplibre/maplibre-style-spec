import {defineConfig} from '@solidjs/start/config';

const config = defineConfig({
    start: {
        server: {
            // baseURL: '/offset',
            prerender: {
                crawlLinks: true
            }
        }
    }
});

export default config;
