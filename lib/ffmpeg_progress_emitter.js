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
    this.unprocessedLinePart = '';
    this.progressMode = false;
    this.on('end', () => {
      if (this.unprocessedLinePart !== '') { this.logBuffer.push(this.unprocessedLinePart); }
    });
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
   * Return the last n progress data chunks pushed into the stream
   * @param {number} n - the number of chunks to return (default: 1)
   * 
   * @returns {string|Array<string>} - the last chunk (default) or an array of n chunks (for n > 1)
   */
  lastProgressChunks (n = 1) {
    if (this.progressBuffer.length === 0) { return this.progressBuffer; }
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
    let chunkString = (encoding === 'buffer') ? chunk.toString() : chunk.toString(encoding);
    chunkString = this.unprocessedLinePart + chunkString;
    while (this._needsMoreProcessing(chunkString)) {
      const meta = this._nextProcessablePiece(chunkString, this.progressMode);
      const piece = chunkString.substring(0, meta.index);
      chunkString = chunkString.substring(meta.index + 1);
      this._processPiece(piece, meta.type);
      this.progressMode = meta.continueProgressMode;
    }
    this.unprocessedLinePart = chunkString;
    callback();
  }

  /**
   * Tests a stream chunk to see if it needs more processing
   * @param {string} s - the chunk to test
   * @returns {boolean} - whether the chunk needs more processing
   */
  _needsMoreProcessing (s) {
    const hasNewLine = (s.indexOf('\n') !== -1);
    const hasCarriageReturn = (s.indexOf('\r') !== -1);
    return (hasNewLine || hasCarriageReturn);
  }

  /**
   * Returns metadata about the next processable piece of the chunk
   * @param {string} s - the chunk to derive information about
   * @returns {Object} - the metadata object
   */
  _nextProcessablePiece (s) {
    const crIndex = s.indexOf('\r'), nlIndex = s.indexOf('\n'),
      noNL = nlIndex === -1, noCR = crIndex === -1,
      crBeforeNL = (crIndex < nlIndex || noNL) && !noCR,
      nlBeforeCR = (nlIndex < crIndex || noCR) && !noNL,
      crIsNext = crBeforeNL && !noCR, nlIsNext = nlBeforeCR && !noNL,
      isProgress = this.progressMode || crIsNext,
      isLog = nlIsNext && !isProgress;
    let nextPieceMeta;
    if (isProgress) {
      const returnIndex = crIsNext ? crIndex : nlIndex;
      nextPieceMeta = {
        index: returnIndex,
        type: 'progress',
        continueProgressMode: crIsNext
      };
    } else if (isLog) {
      nextPieceMeta = {
        index: nlIndex,
        type: 'log',
        continueProgressMode: false
      };
    }
    return nextPieceMeta;
  }

  /**
   * Process a piece of the chunk in a particular mode
   * @param {string} piece - the piece of the chunk to process
   * @param {string} mode - the mode to use in processing the piece
   * @returns {void}
   */
  _processPiece (piece, mode) {
    if (mode === 'progress') { this._processProgress(piece); }
    if (mode === 'log') { this._processLog(piece); }
  }

  /**
   * Process a piece of the chunk in progress mode
   * @param {string} p - the progress piece to process
   * @returns {void}
   */
  _processProgress (p) {
    const progressData = this._parseProgress(p);
    this._emitUpdateEvent(progressData);
    this.progressBuffer.push(progressData);
  }

  /**
   * Parse a progress string into a data object
   * @param {string} p - the progress string to process
   * @returns {Object} - the parsed data
   */
  _parseProgress (p) {
    const tsRegExp = /^\d{2}:\d{2}:\d{2}.\d{2}$/;
    const numRegExp = /^\-?\d+(?:\.\d+)?$/;
    const progressParts = p.replace(/=\s+/g, '=').trim().split(' ');
    const progressData = {};

    let progressKey, progressValue;
    for (const part of progressParts) {
      [progressKey, progressValue] = part.split('=', 2);
      if (typeof progressValue === 'undefined') {
        // TODO: do we abort here like fluent-ffmpeg does, or get what we can and return it anyway?
        // https://github.com/fluent-ffmpeg/node-fluent-ffmpeg/blob/9cc9c4998d8f48414fbba19696f7f1afe6912dd9/lib/utils.js#L20
        return undefined; // or `continue;`
      }
      if (numRegExp.test(progressValue)) {
        progressValue = parseFloat(progressValue);
      } else if (tsRegExp.test(progressValue)) {
        progressValue = this._parseTimestamp(progressValue);
      }
      progressData[progressKey] = progressValue;
    }
    return progressData;
  }

  /**
   * Process a piece of the chunk in log mode
   * @param {string} l - the log string to process
   * @returns {void}
   */
  _processLog (l) {
    const logline = l.trimRight();
    if (logline !== '') { this.logBuffer.push(logline); }
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
   * Parses timestamp strings into a number of seconds
   * @param {string} timestamp - the timestamp string
   * @returns {number} the number of seconds represented by the timestamp
   * @private
   */
  _parseTimestamp (timestamp) {
    const parts = timestamp.split(':');
    const seconds = (parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10)) * 60 + parseFloat(parts[2]);
    return seconds;
  }
}

module.exports = FFmpegProgressEmitter;
