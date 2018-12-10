/**
 * FFmpeg Output module.
 * @module FFmpeg_output
 */

/** Class representing an FFmpeg output file */
class FFmpegOutput {
  /**
   * Create an output for an FFmpeg command
   * @param {string} url - the location of the output file
   * @param {Object} options - the options for the output 
   */
  constructor (url, options = new Map()) {
    if (!url) {
      throw new Error('Invalid arguments: url parameter is required');
    }
    this.url = url;
    this.options = FFmpegOutput.validateOptions(options);
  }

  /**
   * Generate the command array segment for this FFmpeg output
   * @return {Array} the command array segment
   */
  toCommandArray () {
    let cmd = [`${this.url}`];
    this.options.forEach((value, opt) => {
      // Note: FFmpeg options on inputs prepend the output filename
      cmd.unshift(String(value));
      cmd.unshift(`-${opt}`);
    });
    return cmd;
  }

  /**
   * Generate the command string segment for this FFmpeg output
   * @return {string} the command string segment
   */
  toCommandString () {
    return this.toCommandArray()
      .map((elt) => elt.startsWith('-') ? elt : `"${elt}"`)
      .join(' ');
  }

  /**
   * Validate the options passed into the constructor
   * @param {Object} options - the options for the output
   * @return {boolean} true if validated
   */
  static validateOptions (options) {
    let opts = options;
    if (!(opts instanceof Map)) {
      opts = new Map(Object.entries(options));
    }
    return (opts);
  }
}

module.exports = FFmpegOutput;
