const config = new require('./util/config')();
const logger = config.logger;
const util = require('util');

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
    // Note: FFmpeg options on outputs prepend the output filename
    let cmd = [];
    this.options.forEach((o) => { cmd = cmd.concat(o.toCommandArray()); });
    cmd.push(`${this.url}`);
    return cmd;
  }

  /**
   * Generate the command string segment for this FFmpeg output
   * @return {string} the command string segment
   */
  toCommandString () {
    return this.toCommandArray()
      .map((elt) => elt.startsWith('-') ? elt : `"${elt.replace(/\"/g, '\\"')}"`)
      .join(' ');
  }

  /**
   * Generate a developer-friendly string representing for this FFmpeg output
   * @returns {string} the string representation
   */
  toString () {
    return `FFmpegOutput(url: "${this.url}", options: ${util.inspect(this.options)})`;
  }

  /**
   * 
   * @param {Object} options - the options to be added to the output
   * @returns {void}
   */
  addOptions (options) {
    const optObjects = FFmpegOutput.validateOptions(options);
    this.options = this.options.concat(optObjects);
  }
  
  /**
   * Validate the options passed into the constructor
   * @param {Object} options - the options for the output
   * @return {Array<FFmpegOption>} array of validated FFmpegOption objects
   */
  static validateOptions (options) {
    const FFmpegOption = FFmpegOutput._loadFFmpegOption();
    logger.debug(`Validating options: ${JSON.stringify(options)}`);
    let opts = options;
    if (!(opts instanceof Map)) {
      opts = new Map(Object.entries(options));
    }
    const ctx = FFmpegOption.FFmpegOptionContexts.OUTPUT;
    const optObjects = Array.from(opts)
      .map(([name, arg]) => new FFmpegOption(name, ctx, arg));
    logger.debug(`Completed validating options: ${JSON.stringify(optObjects)}`);
    return (optObjects);
  }

  /**
   * Load the FFmpegOption class and return it
   * 
   * @returns {FFmpegOption} - the FFmpegOption class
   *
   * @private
   */
  static _loadFFmpegOption () {
    return require('./ffmpeg_option');
  }
}

module.exports = FFmpegOutput;
