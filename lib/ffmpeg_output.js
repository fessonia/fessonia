/**
 * FFmpeg Output module.
 * @module FFmpeg_output
 */

/** Class representing an FFmpeg output file */
class FFmpegOutput {
  /**
   * Create an output for an FFmpeg command
   * @param {Object} options - the options for the output 
   */
  constructor (options) {
    FFmpegOutput.validateOptions(options);
    this.options = options;
    this.url = options.file ? options.file : options.url;
  }

  /**
   * Generate the command array segment for this FFmpeg output
   * @return {Array} the command array segment
   */
  toCommandArray () {
    let cmd = [`"${this.url}"`];
    Object.keys(this.options)
      .filter((k) => this.options.hasOwnProperty(k))
      .filter((k) => k !== 'file' && k !== 'url')
      .forEach((opt) => {
        // Note: FFmpeg options on inputs prepend the output filename
        cmd.unshift(`${this.options[opt]}`);
        cmd.unshift(`-${opt}`);
      });
    return cmd;
  }

  /**
   * Generate the command string segment for this FFmpeg output
   * @return {string} the command string segment
   */
  toCommandString () {
    return this.toCommandArray().join(' ');
  }

  /**
   * Validate the options passed into the constructor
   * @param {Object} options - the options for the output
   * @return {boolean} true if validated
   */
  static validateOptions (options) {
    if (!options.hasOwnProperty('file') && !options.hasOwnProperty('url')) {
      throw new Error('Could not create FFmpegOutput object: options argument missing required property. Must have one of: "file" or "url".');
    }
    return (true);
  }
}

module.exports = FFmpegOutput;
