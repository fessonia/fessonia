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
    this.progressBuffer = [];
    this.currentInput;
    this.unprocessedLinePart = '';
    this.on('end', () => {
      if (this.unprocessedLinePart !== '') { this.logBuffer.push(this.unprocessedLinePart); }
    })
  }

  /**
   * Return the last n log data chunks pushed into the stream
   * @param {number} n - the number of chunks to return (default: 1)
   * 
   * @returns {string|Array<string>} - the last chunk (default) or an array of n chunks (for n > 1)
   */
  last (n = 1) {
    if (this.logBuffer.length === 0) { return this.logBuffer; }
    if (n === 1) { return this.logBuffer[this.logBuffer.length - 1]; }
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
   * Return the last n progress data chunks pushed into the stream
   * @param {number} n - the number of chunks to return (default: 1)
   * 
   * @returns {string|Array<string>} - the last chunk (default) or an array of n chunks (for n > 1)
   */
  lastProgressChunks (n = 1) {
    if (this.progressBuffer.length === 0) { return this.progressBuffer; }
    if (n === 1) { return this.progressBuffer[this.progressBuffer.length - 1]; }
    const start = Math.max(this.progressBuffer.length - n, 0);
    return this.progressBuffer.slice(start);
  }
  
  /**
   * Return all progress data chunks pushed into the stream from the buffer
   * 
   * @returns {string|Array<string>} - an array of chunks of progress data
   */
  progressChunks () {
    return this.progressBuffer;
  }

  /**
    * Parse data packets from the stream and emit update event
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
    const lines = (encoding === 'buffer' ? chunk.toString() : chunk.toString(encoding))
      .split(/\r\n|\n/)
      .map((line) => line + '\n');
    lines[lines.length - 1] = lines[lines.length - 1].replace(/\n$/, '');
    lines[0] = this.unprocessedLinePart + lines[0];
    const logLines = [];
    lines.forEach((line) => { // NOTE: progress data not separated by line breaks!
      const nonProgressLine = this._processLineForProgressData(line);
      if (nonProgressLine) { logLines.push(nonProgressLine); }
    });
    if (logLines.length > 0) {
      if (logLines[logLines.length - 1].endsWith('\n')) {
        this.unprocessedLinePart = '';
      } else {
        this.unprocessedLinePart = logLines.pop();
      }
      logLines.forEach((line) => {
        if (line !== '') { this.logBuffer.push(line.trimRight()); }
      });
    }
    callback();
  }

  /**
   * Process a line of the stream to extract progress data
   * @param {string} line - the line to be processed
   * @returns {string|undefined} - line if not processed as progress, undefined otherwise
   * @private
   */
  _processLineForProgressData (line) {
    if (typeof line !== 'string') { throw new Error('Invalid parameter line: must be string type') }
    if (line === '') { return line; }
    const inputMatch = line.match(/Input \#(\d+)/);
    if (inputMatch) {
      const newInput = parseInt(inputMatch[1]);
      this.currentInput = newInput;
    }
    const outputMatch = line.match(/Output \#(\d+)/);
    if (outputMatch) {
      const newOutput = parseInt(outputMatch[1]);
      this.currentOutput = newOutput;
    }
    const progressData = this._parseProgressLine(line);
    if (progressData) {
      // process as progress line
      this._emitUpdateEvent(progressData);
      this.progressBuffer.push(progressData);
      return;
    } else {
      // return for processing as log line
      return line;
    }
  }

  /**
   * Parse a line as a progress update
   * @param {string} line - the line to be processed
   * @returns {Object|undefined} - the object of parsed progress data, or undefined if not a progress line
   * @private
   */
  _parseProgressLine (line) {
    const tsRegExp = /^\d{2}:\d{2}:\d{2}.\d{2}$/;
    const numRegExp = /^\-?\d+(?:\.\d+)?$/;
    if (!/=/.test(line)) { return undefined; }
    const progressParts = line.replace(/=\s+/g, '=').trim().split(' ');
    const progressData = {};
    // TODO: this was included in our prior processing. Keep it?
    if (this.currentInput) {
      progressData.inputIndex = this.currentInput;
    }
    if (this.currentOutput) {
      progressData.outputIndex = this.currentOutput;
    }

    let progressKey, progressValue;
    for (const part of progressParts) {
      [progressKey, progressValue] = part.split('=', 2);
      if (typeof progressValue === 'undefined') {
        // TODO: do we abort here like fluent-ffmpeg does, or get what we can and return it anyway?
        // https://github.com/fluent-ffmpeg/node-fluent-ffmpeg/blob/9cc9c4998d8f48414fbba19696f7f1afe6912dd9/lib/utils.js#L20
        return undefined; // or `continue;`
      }
      if (numRegExp.test(progressValue)) {
        progressValue = FFmpegProgressEmitter._parseNumeric(progressValue);
      } else if (tsRegExp.test(progressValue)) {
        progressValue = FFmpegProgressEmitter._parseTimestamp(progressValue);
      }
      progressData[progressKey] = progressValue;
    }

    // TODO: this was included in our prior processing. Keep it?
    if (progressData.hasOwnProperty('frame')) {
      progressData.streamType = 'video';
    } else {
      progressData.streamType = 'audio';
    }

    return progressData;
  }

  /**
   * Emit an 'update' event with progress data
   * @param {Object} progressData - the data to be sent in the progress event
   * @returns {void}
   * @emits FFmpegProgressEmitter#update
   * @private
   */
  _emitUpdateEvent (progressData) {
    /**
      * update event
      *
      * @event FFmpegProgressEmitter#update
      * @type {object}
      * @property {...Object} progressData - all properties included in the progressData object
      */
    this.emit('update', progressData);
  }

  /**
   * Parse numeric timestamp strings into a number value
   * @param {string} numeric - the numeric string
   * @returns {number} the number represented by the string
   * @private
   * @static 
   */
  static _parseNumeric (numeric) {
    const f = parseFloat(numeric);
    const i = parseInt(numeric);
    if (Math.floor(f) === i && i.toString(10) === numeric) { return i; }
    return f;
  }

  /**
   * Parses timestamp strings into a number of seconds
   * @param {string} timestamp - the timestamp string
   * @returns {number} the number of seconds represented by the timestamp
   * @private
   * @static
   */
  static _parseTimestamp (timestamp) {
    const parts = timestamp.split(':');
    const seconds = (parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10)) * 60 + parseFloat(parts[2]);
    return seconds;
  }
}

module.exports = FFmpegProgressEmitter;
