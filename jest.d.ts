declare global {
    namespace jest {
        interface Matchers<R> { // eslint-disable-line @typescript-eslint/no-unused-vars
            /**
             * @param expectedSerialized Color serialized as string in format 'rgb(r% g% b% / alpha)'
             * @param precision `expect.closeTo` precision parameter
             */
            toMatchColor(expectedSerialized: string, precision?: number): void;
        }
    }
}

export {};
