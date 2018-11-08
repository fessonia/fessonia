/**
 * FFmpeg Input module.
 * @module ffmpeg_input
 */

/** Class representing an FFmpeg input file (`-i`) */
class FfmpegInput {
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
    FfmpegInput.validateOptions(options);
    this.options = options;
  }

  /**
   * Generate the command string segment for this FFmpeg input
   * @return {string} the command string segment
   */
  toCommandString () {
    let cmd = `-i "${this.url}"`;
    Object.keys(this.options)
      .filter((k) => this.options.hasOwnProperty(k))
      .forEach((opt) => {
        if (opt === "ss" || opt === "sseof") {
          cmd = `-${opt} ${this.options[opt]} ${cmd}`;
        } else {
          cmd = `${cmd} -${opt} ${this.options[opt]}`;
        }
      });
    return cmd;
  }

  /**
   * Validate the options passed into the constructor
   * @param {Object} options - the options for the input
   * @return {boolean} true if validated
   */
  static validateOptions (options) {
    // TODO: validate input options here
    return (true);
  }
}

module.exports = FfmpegInput;
