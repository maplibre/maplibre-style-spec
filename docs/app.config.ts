import {defineConfig} from '@solidjs/start/config';

export default defineConfig({
    ssr: true,
    solid: {
        babel: {
            plugins: [
                [
                    '@babel/plugin-syntax-import-attributes',
                    {
                        deprecatedAssertSyntax: true,
                    },
                ],
            ],
        }
    },
    server: {
        preset: 'static',
        baseURL: '/maplibre-style-spec',
    }
});
