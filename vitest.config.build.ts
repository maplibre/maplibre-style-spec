import {defineConfig} from 'vitest/config';

export default defineConfig({
    test: {
        name: 'build',
        environment: 'node',
        include: [
            'test/build/**/*.test.{ts,js}',
        ],
        coverage: {
            provider: 'v8',
            reporter: ['json', 'html'],
            exclude: ['node_modules/', 'dist/', '**/*.{test,test-d}.ts'],
            all: true,
            include: ['src'],
            reportsDirectory: './coverage/vitest/build',
        },
    }
}); 