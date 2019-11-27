/**
 * @fileOverview lib/ffmpeg_progress_emitter.js - Defines and exports the FFmpegProgressEmitter class
 *
 * @private
 */

const { Writable } = require('stream');

/**
 * A class that implements a progress event emitter for FFmpegCommand executions
 *
 * @extends stream.Writable
 */
class FFmpegProgressEmitter extends Writable {
  /**
   * Create an FFmpegProgressEmitter object for use in monitoring execution progress
   * Can maybe remove the constructor here for simplicity
   *
   * @param {Object} options - options for the Writable stream
   */
  constructor (options) {
    super(options);
    this.logBuffer = [];
    this.progressData = {};
    this.partialProgressData = {};
  }

  /**
   * Return the last n log data chunks pushed into the stream
   * @param {number} n - the number of chunks to return (default: 1)
   *
   * @returns {string|Array<string>} - the last chunk (default) or an array of n chunks (for n > 1)
   */
  last (n = 1) {
    if (this.logBuffer.length === 0) { return this.logBuffer; }
    const start = Math.max(this.logBuffer.length - n, 0);
    return this.logBuffer.slice(start);
  }

  /**
   * Return all log data chunks pushed into the stream from the buffer
   *
   * @returns {string|Array<string>} - an array of chunks of log data
   */
  logData () {
    return this.logBuffer;
  }

  /**
   * Get latest media time from progress updates
   * @returns {string} - the latest media timestamp seen in progress updates from ffmpeg
   */
  lastMediaTime () {
    if (this.progressData.hasOwnProperty('out_time')) {
      return this.progressData.out_time;
    }
    return '0';
  }

  /**
    * Parse lines from the stream and emit update event
    * This method is called internally by Writable stream
    *
    * @param {Buffer|string} chunk - the data packet from the piped stream
    * @param {string} encoding - how the packet is encoded (utf8, buffer)
    * @param {Function} callback - callback to call when processing complete
    *
    * @fires FFmpegProgressEmitter#update
    *
    * @returns {void}
    */
  _write (chunk, encoding, callback) {
    let chunkString = (encoding === 'buffer') ? chunk.toString() : chunk.toString(encoding);
    if (/\r$/.test(chunkString)) {
      return callback();
    }
    if (/^[^\s=]+=[^=]+\n$/.test(chunkString)) {
      this._parseProgress(chunkString.trim());
    } else {
      this.logBuffer.push(chunkString);
    }
    callback();
  }

  /**
   * Parse a progress string into a data object
   * @param {string} p - the progress string ('key=value') to process
   * @returns {Object} - the parsed data
   */
  _parseProgress (p) {
    const numRegExp = /^\-?\d+(?:\.\d+)?$/;
    let [progressKey, progressValue] = p.split('=');
    if (progressKey == 'progress') {
      this._emitUpdateEvent();
    } else {
      progressValue = progressValue.trim();
      if (numRegExp.test(progressValue)) {
        progressValue = parseFloat(progressValue);
      }
      this.partialProgressData[progressKey] = progressValue;
    }
  }

  /**
   * Emit an 'update' event with progress data
   * @param {Object} progressData - the data to be sent in the progress event
   * @returns {void}
   * @emits FFmpegProgressEmitter#update
   * @private
   */
  _emitUpdateEvent () {
    this.progressData = { ...this.partialProgressData };
    this.partialProgressData = {};
    /**
      * update event
      *
      * @event FFmpegProgressEmitter#update
      * @type {object}
      * @property {...Object} progressData - all properties included in the progressData object
      */
    this.emit('update', this.progressData);
  }
}

module.exports = FFmpegProgressEmitter;
