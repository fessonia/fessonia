const { WritableStream } = require('stream');

/**
 * A class that implements a progress event emitter for FFmpegCommand executions
 */
class FFmpegProgressEmitter extends WritableStream {
  /**
   * Create an FFmpegProgressEmitter object for use in monitoring execution progress
   * Can maybe remove the constructor here for simplicity
   */
   constructor(options) {
     super(options);
   }

   /**
    * Parse data packets from the stream and emit update event
    * This method is called internally by WritableStream
    *
    * @param {Buffer|String} chunk - the data packet from the piped stream
    * @param {String} encoding - how the packet is encoded (utf8, buffer)
    * @param {Function} callback - callback to call when processing complete
    *
    * @fires FFmpegProgressEmitter#update
    *
    * @returns {void}
    */
   _write(chunk, encoding, callback) {
     data = data.toString();
     const timeMatch = data.match(/time=(\d{2}:\d{2}:\d{2}.\d{2})/);
     const etaMatch = data.match(/eta=(\d{2}:\d{2}:\d{2}.\d{2})/);
     let newTime, newETA;
     if (timeMatch != null) {
       newTime = FFmpegProgressEmitter._parseTimestamp(timeMatch[1]);
     }
     if (etaMatch != null) {
       newETA  = FFmpegProgressEmitter._parseTimestamp(etaMatch[1]);
     }
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
       timeRemaining : newETA
     });
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
