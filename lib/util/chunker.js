/**
 * @fileOverview lib/util/chunker.js - Defines and exports a utility class
 *                                     handling chunking of output for use
 *                                     as a preprocessor to FFmpegProgressEmitter
 * @private
 */
const { Transform } = require('stream');
const { StringDecoder } = require('string_decoder');

/**
 * Transform stream class for chunking UTF-8 text streams by new lines
 *
 * NOTE: This class is for internal use, intended as a
 * preprocessor of IO streams from FFmpegCommand prior to
 * piping into the FFmpegProgressEmitter. It is not intended
 * for use as a library interface to other code.
 *
 * @private
 */
class Chunker extends Transform {
  /**
   * @constructor
   * @param {Object} options - stream options
   */
  constructor (options) {
    super(options);
    this.decoder = new StringDecoder('utf8');
  }

  /**
   * Transforms stream chunks as needed. Internal implementation: MUST NOT be called directly.
   * @param {Buffer|string|any} chunk - the incoming stream chunk to be transformed
   * @param {string} encoding - the encoding of the chunk
   * @param {Function} callback - a callback function to be called after the chunk has been processed
   * @returns {void}
   * @private
   */
  _transform (chunk, encoding, callback) {
    let chunkString = this.decoder.write(chunk);
    if (this.bufferedLine) {
      chunkString = this.bufferedLine + chunkString;
      this.bufferedLine = undefined;
    }
    let lines = chunkString.split(/(?<=[\r\n])/);
    for (let line of lines) {
      if (/[\r\n]$/.test(line)) {
        this.push(line);
      } else {
        this.bufferedLine = line;
      }
    }
    callback();
  }

  /**
   * Flushes the stream buffer. Internal implementation: MUST NOT be called directly.
   * @param {Function} callback - a callback to be called once flush is complete
   * @returns {void}
   * @private
   */
  _flush (callback) {
    this.push(this.bufferedLine);
    callback();
  }
}

module.exports = Chunker;
