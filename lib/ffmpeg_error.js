/**
 * @fileOverview lib/ffmpeg_error.js - Defines and exports the FFmpegError class
 */

class FFmpegError extends Error {
  constructor(error) {
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
