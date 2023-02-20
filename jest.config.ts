import type {Config} from 'jest';

const sharedConfig = {
    transform: {
        // use typescript to convert from esm to cjs
        '[.](m|c)?(ts|js)(x)?$': ['ts-jest', {
            'isolatedModules': false,
        }],
    },
    // any tests that operate on dist files shouldn't compile them again.
    transformIgnorePatterns: ['<rootDir>/dist']
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
