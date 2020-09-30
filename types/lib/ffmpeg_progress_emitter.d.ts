export = FFmpegProgressEmitter;
/**
 * A class that implements a progress event emitter for FFmpegCommand executions
 *
 * @extends stream.Writable
 */
declare class FFmpegProgressEmitter {
    /**
     * Create an FFmpegProgressEmitter object for use in monitoring execution progress
     * Can maybe remove the constructor here for simplicity
     *
     * @param {Object} options - options for the Writable stream
     */
    constructor(options: any);
    logBuffer: any[];
    progressData: {};
    partialProgressData: {};
    /**
     * Return the last n log data chunks pushed into the stream
     * @param {number} n - the number of chunks to return (default: 1)
     *
     * @returns {string|Array<string>} - the last chunk (default) or an array of n chunks (for n > 1)
     */
    last(n?: number): string | Array<string>;
    /**
     * Return all log data chunks pushed into the stream from the buffer
     *
     * @returns {string|Array<string>} - an array of chunks of log data
     */
    logData(): string | Array<string>;
    /**
     * Return all log data chunks with time from last progress from ffmpeg
     *
     * @returns {string} - a string containing the log data
     */
    formattedLog(): string;
    /**
     * Get latest media time from progress updates
     * @returns {string} - the latest media timestamp seen in progress updates from ffmpeg
     */
    lastMediaTime(): string;
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
      *
      * @private
      */
    private _write;
    /**
     * Parse a progress string into a data object
     * @param {string} p - the progress string ('key=value') to process
     * @returns {Object} - the parsed data
     * @private
     */
    private _parseProgress;
    /**
     * Emit an 'update' event with progress data
     * @param {Object} progressData - the data to be sent in the progress event
     * @returns {void}
     * @emits FFmpegProgressEmitter#update
     * @private
     */
    private _emitUpdateEvent;
}
