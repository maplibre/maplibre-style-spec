import type {Config} from 'jest';

const sharedConfig = {
    extensionsToTreatAsEsm: ['.ts'],
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    transform: {
        // use typescript to convert from esm to cjs
        '[.](m|c)?(ts|js)(x)?$': ['ts-jest', {
            isolatedModules: true,
            useESM: true,
        }],
    },
    // any tests that operate on dist files shouldn't compile them again.
    transformIgnorePatterns: ['<rootDir>/dist'],
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
} as Partial<Config>;

const config: Config = {
    projects: [
        {
            displayName: 'unit',
            testEnvironment: 'jsdom',
            testMatch: [
                '<rootDir>/src/**/*.test.{ts,js}'
            ],
            ...sharedConfig
        },
        {
            displayName: 'integration',
            testEnvironment: 'node',
            testMatch: [
                '<rootDir>/test/integration/**/*.test.{ts,js}',
            ],
            ...sharedConfig,
        },
        {
            displayName: 'build',
            testEnvironment: 'node',
            testMatch: [
                '<rootDir>/test/build/**/*.test.{ts,js}',
            ],
            ...sharedConfig,
        },
    ]
};

export default config;
