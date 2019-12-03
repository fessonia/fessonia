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
class FFmpegError extends Error {
  /**
   * @constructor FFmpegError
   * @param {Object} error - the error object to wrap
   */
  constructor (error) {
    let message = error.progress ?
      // last line from the progress object; spawn errors go here
      error.progress.last().pop() :
      // last line of ffmpeg stderr (when passed in from execute); execFile errors go here
      error.message.trim().split('\n').pop();
    // last line of ffmpeg stderr usually contains most helpful error
    super(message);
    this.name = this.constructor.name;
    this.code = error.code;
    this.log = error.progress ? error.progress.formattedLog() : error.message;
    this.killed = error.killed;
    this.signal = error.signal;
    this.progress = error.progress;
    this.cmd = error.cmd;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = FFmpegError;
