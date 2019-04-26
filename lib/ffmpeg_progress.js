/**
 * A class that implements a progress event emitter for FFmpegCommand executions
 */
class FFmpegProgressEmitter extends ReadableStream {
  /**
   * Create an FFmpegProgressEmitter object for use in monitoring execution progress
   * 
   * @param {ReadableStream} stream - the ffmpeg stderr stream to monitor for progress updates
   */
  constructor (stream) {
    stream.on('data', this.parseProgress.bind(this));
    stream.on('end', this.endProgress.bind(this));

    this.pipe(stream);
  }

  /**
   * Parse data packets from the stream and emit update event
   * 
   * @param {Buffer} data - the data packet from the piped stream
   * 
   * @fires FFmpegProgressEmitter#update
   * 
   * @returns {void}
   */
  parseProgress (data) {
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
   * End the progress updates
   * 
   * @param {Buffer} data - the incoming data from the event on the piped stderr stream
   * 
   * @fires FFmpegProgressEmitter#success
   * @fires FFmpegProgressEmitter#failure
   * @fires FFmpegProgressEmitter#end
   * 
   * @returns {void}
   */
  endProgress (data) {
    data = data.toString();
    const parsedData = this._parseComplete(data);

    if (!parsedData.success) {
      /**
       * failure event
       *
       * @event FFmpegProgressEmitter#failure
       * @type {object}
       * @property {object} error - the error reported in the ffmpeg output stream
       */
      this.emit('failure', {
        error: parsedData.error !== undefined ? parsedData.error : 'Unknown error occurred during ffmpeg processing.'
      });
    } else {
      /**
       * success event
       *
       * @event FFmpegProgressEmitter#success
       * @type {object}
       * @property {boolean} success - always true in this case
       * @property {number} elapsed - elapsed time in seconds
       */
      this.emit('success', parsedData);
    }
    /**
     * end event
     *
     * @event FFmpegProgressEmitter#end
     * @type {object}
     */
    this.emit('end', {});
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

  /**
   * Parses data to determine success or failure of execution on stream end
   * @param {string} data - the stream data as a string
   * 
   * @returns {Object} parsed data from the stream, including a 'success' boolean
   */
  static _parseComplete (data) {
    // TODO: actually implement this, and stop always returning success
    return {
      success: true
    };
  }
}
