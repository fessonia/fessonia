declare const TestReadableStream_base: any;
/**
 * Test readable stream class (for internal use in testing only)
 */
declare class TestReadableStream extends TestReadableStream_base {
    [x: string]: any;
    /**
     * Required _read method of Readable interface. Logging no-op.
     * @returns {void}
     */
    _read(): void;
}
export function expectLast(tested: any, expected: any): void;
export function expectSequences(tested: any, sequences: any): void;
export function createTestReadableStream(): TestReadableStream;
export function createTestReadableStream(): TestReadableStream;
export {};
