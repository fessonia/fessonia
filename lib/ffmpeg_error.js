/**
 * @fileOverview lib/ffmpeg_error.js - Defines and exports the FFmpegError class
 */

class FFmpegError extends Error {
  constructor(error) {
    // last line of ffmpeg stderr usually contains most helpful error
    super(error.message.trim().split('\n').pop());
    this.name = this.constructor.name;
    this.code = error.code
    this.stderr = error.message;
    this.killed = error.killed;
    this.signal = error.signal;
    this.progress = error.progress;
    this.cmd = error.cmd;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = FFmpegError;
