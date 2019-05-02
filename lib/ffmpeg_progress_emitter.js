const { Writable } = require('stream');

/**
 * A class that implements a progress event emitter for FFmpegCommand executions
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
    this.bufferedData = [];
  }

  /**
   * Return the last n chunks pushed into the stream
   * @param {number} n - the number of chunks to return (default: 1)
   * 
   * @returns {string|Array<string>} - the last chunk (default) or an array of n chunks (for n > 1)
   */
  last (n = 1) {
    if (n === 1) return this.bufferedData[this.bufferedData.length - 1];
    const start = max(this.bufferedData.length - n, 0);
    return this.bufferedData.slice(start, start + n);
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
    const data = encoding === 'buffer' ? chunk.toString() : chunk.toString(encoding);
    this.bufferedData.push(data);
    const timeMatch = data.match(/time=\s*(\d{2}:\d{2}:\d{2}.\d{2})/),
      etaMatch = data.match(/eta=\s*(\d{2}:\d{2}:\d{2}.\d{2})/),
      frameMatch = data.match(/frame=\s*(\d+)/),
      fpsMatch = data.match(/fps=\s*([\d\.]+)/),
      qMatch = data.match(/q=\s*(\-?[\d\.]+)/),
      sizeMatch = data.match(/size=\s*([\d\.]+[kMG]?B)/),
      bitrateMatch = data.match(/bitrate=\s*([\d\.]+[kMG]?bits\/s)/),
      speedMatch = data.match(/speed=\s*(\d+\.\d+x)/);
            

    let progressType, newTime, newETA, newFrame, newFPS, newQ, newSize, newBitrate, newSpeed;
    if (timeMatch != null) {
      newTime = FFmpegProgressEmitter._parseTimestamp(timeMatch[1]);
    }
    if (etaMatch != null) {
      newETA  = FFmpegProgressEmitter._parseTimestamp(etaMatch[1]);
    }
    if (frameMatch != null) {
      newFrame = parseInt(frameMatch[1]);
      progressType = 'video';
    } else {
      progressType = 'audio';
    }
    if (fpsMatch != null) { newFPS = parseFloat(fpsMatch[1]); }
    if (qMatch != null) { newQ = parseFloat(qMatch[1]); }
    if (sizeMatch != null) { newSize = sizeMatch[1]; }
    if (bitrateMatch != null) { newBitrate = bitrateMatch[1]; }
    if (speedMatch != null) { newSpeed = speedMatch[1]; }
    /**
      * update event
      *
      * @event FFmpegProgressEmitter#update
      * @type {object}
      * @property {number|undefined} currentTime - current time in seconds into the media ffmpeg has completed processing
      * @property {number|undefined} timeRemaining - the estimated number of wall-clock seconds of processing remaining
      */
    this.emit('update', {
      currentTime   : newTime,
      timeRemaining : newETA,
      streamType    : progressType,
      frame         : newFrame,
      fps           : newFPS,
      q             : newQ,
      size          : newSize,
      bitrate       : newBitrate,
      speed         : newSpeed
    });

    callback();
  }

  /**
   * Parses timestamp strings into a number of seconds
   * @param {string} timestamp - the timestamp string
   *
   * @returns {number} the number of seconds represented by the timestamp
   */
  static _parseTimestamp (timestamp) {
    const parts = timestamp.split(':');
    const seconds = (parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10)) * 60 + parseFloat(parts[2]);
    return seconds;
  }
}

module.exports = FFmpegProgressEmitter;
