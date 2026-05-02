import {defineConfig} from 'vitest/config';

export default defineConfig({
    test: {
        name: 'build',
        environment: 'node',
        include: ['test/build/**/*.test.{ts,js}'],
        typecheck: {
            enabled: true,
            include: ['test/build/**/*.test-d.ts'],
            tsconfig: './test/build/tsconfig.json'
        },
        coverage: {
            provider: 'v8',
            reporter: ['json', 'html'],
            exclude: ['node_modules/', 'dist/', '**/*.{test,test-d}.ts'],
            all: true,
            include: ['src/**/*.ts'],
            reportsDirectory: './coverage/vitest/build'
        }
    }
});
