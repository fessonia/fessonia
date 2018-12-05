/**
 * FFmpeg Input module.
 * @module ffmpeg_input
 */

/** Class representing an FFmpeg input file (`-i`) */
class FFmpegInput {
  /**
   * Create an input for an FFmpeg command
   * @param {string} url - the address of the input file
   * @param {Object} options - the options for the input 
   */
  constructor (url, options = {}) {
    if (!url) {
      throw new Error('Invalid arguments: url parameter is required');
    }
    this.url = url;
    FFmpegInput.validateOptions(options);
    this.options = options;
  }

  /**
   * Generate the command array segment for this FFmpeg input
   * @return {Array} the command array segment
   */
  toCommandArray () {
    let cmd = ['-i', this.url];
    Object.keys(this.options)
      .forEach((opt) => {
        // Note: FFmpeg options on inputs prepend the -i option
        cmd.unshift(String(this.options[opt]));
        cmd.unshift(`-${opt}`);
      });
    return cmd;
  }

  /**
   * Generate the command string segment for this FFmpeg input
   * @return {string} the command string segment
   */
  toCommandString () {
    return this.toCommandArray()
      .map((elt) => elt.startsWith('-') ? elt : `"${elt}"`)
      .join(' ');
  }

  /**
   * Validate the options passed into the constructor
   * @param {Object} options - the options for the input
   * @return {boolean} - true if validated
   */
  static validateOptions (options) {
    // TODO: validate input options here
    return (true);
  }
}

module.exports = FFmpegInput;
