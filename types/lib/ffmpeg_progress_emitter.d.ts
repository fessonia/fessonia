import { Writable, WritableOptions } from 'stream';

export default FFmpegProgressEmitter;

/**
 * A class that implements a progress event emitter for FFmpegCommand executions
 * @private
 */
declare class FFmpegProgressEmitter extends Writable {
    logBuffer: FFmpegProgressEmitter.Log[];
    partialProgressData: FFmpegProgressEmitter.ProgressData;
    progressData: FFmpegProgressEmitter.ProgressData;

    /** Create an FFmpegProgressEmitter object for use in monitoring execution progress */
    constructor(options: WritableOptions);
    /* Return all log data chunks with time from last progress from ffmpeg */
    formattedLog(): string;
    /** Return the last n log data chunks pushed into the stream */
    last(n?: 1): string;
    last(n: number): string[];
    /** Get latest media timestamp seen in progress updates from ffmpeg */
    lastMediaTime(): string;
    /** Return all log data chunks pushed into the stream from the buffer */
    logData(): string[];
}

declare namespace FFmpegProgressEmitter {
    export interface Log {
        text: string;
        time: string;
    }

    export interface ProgressData {
        out_time?: string;
        out_time_ms?: number;
        out_time_us?: number;
        [key: string]: string | number | undefined;
    }
}
