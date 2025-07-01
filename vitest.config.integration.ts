import {defineConfig} from 'vitest/config';

export default defineConfig({
    test: {
        name: 'integration',
        environment: 'node',
        include: [
            'test/integration/**/*.test.{ts,js}',
        ],
        coverage: {
            provider: 'v8',
            reporter: ['json', 'html'],
            exclude: ['node_modules/', 'dist/', '**/*.{test,test-d}.ts'],
            all: true,
            include: ['src'],
            reportsDirectory: './coverage/vitest/integration',
        },
    },
}); 