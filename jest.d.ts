declare global {
    namespace jest {
        interface Matchers<R> { // eslint-disable-line @typescript-eslint/no-unused-vars

            /**
             * @param expectedSerialized Color serialized as string in format 'rgb(r% g% b% / alpha)'
             * @param numDigits `expect.closeTo` numDigits parameter
             */
            toMatchColor(expectedSerialized: string, numDigits?: number): void;

            /**
             * @param expectedArray Expected array of numbers.
             * @param numDigits `expect.closeTo` numDigits parameter
             */
            closeToNumberArray(expectedArray: number[], numDigits?: number): void;

        }
    }
}

export {};
