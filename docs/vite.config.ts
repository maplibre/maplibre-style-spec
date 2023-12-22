import {defineConfig} from '@solidjs/start/config';

const config = defineConfig({
    start: {
        server: {
            prerender: {
                crawlLinks: true
            }
        }
    }
});

export default config;
