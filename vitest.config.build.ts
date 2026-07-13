import {defineConfig} from 'vitest/config';

export default defineConfig({
    test: {
        name: 'build',
        environment: 'node',
        restoreMocks: true,
        include: ['test/build/**/*.test.{ts,js}'],
        coverage: {
            provider: 'v8',
            reporter: ['json', 'html'],
            exclude: ['node_modules/', 'dist/', '**/*.{test,test-d}.ts', 'README.md'],
            include: ['src'],
            reportsDirectory: './coverage/vitest/build'
        }
    }
});
