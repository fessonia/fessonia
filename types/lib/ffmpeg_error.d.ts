export = FFmpegError;
/**
 * @fileOverview lib/ffmpeg_error.js - Defines and exports the FFmpegError class
 */
/**
 * @typedef {FFmpegError}
 * @type {Error}
 * @property {string} name - `'FFmpegError'`
 * @property {string} message - the error message
 * @property {string} cmd - the FFmpeg command string that was executed
 * @property {number} code - the child process' exit code
 * @property {string|undefined} signal - the signal that caused the process termination, if available
 * @property {string|undefined} log - the logs from FFmpeg, with FFmpeg times
 * @property {boolean|undefined} killed - boolean, true if process was killed
 * @property {string|undefined} signal - the signal that stopped the process, if available
 * @property {FFmpegProgressEmitter} progress - the progress emitter, if relevant
 */
declare class FFmpegError extends Error {
    /**
     * @constructor FFmpegError
     * @param {Object} error - the error object to wrap
     */
    constructor(error: any);
    code: any;
    log: any;
    killed: any;
    signal: any;
    progress: any;
    cmd: any;
}
declare namespace FFmpegError {
    export { FFmpegError };
}
type FFmpegError = import("./ffmpeg_error");
