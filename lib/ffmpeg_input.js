/**
 * FFmpeg Input module.
 * @module ffmpeg_input
 */

const config = new require('./util/config')(),
  logger = config.logger;

const FFmpegOption = require('./ffmpeg_option');

/** Class representing an FFmpeg input file (`-i`) */
class FFmpegInput {
  /**
   * Create an input for an FFmpeg command
   * @param {string} url - the address of the input file
   * @param {Object} options - the options for the input 
   */
  constructor (url, options = new Map()) {
    if (!url) {
      throw new Error('Invalid arguments: url parameter is required');
    }
    this.url = url;
    this.options = FFmpegInput.validateOptions(options);
  }

  /**
   * Generate the command array segment for this FFmpeg input
   * @return {Array} the command array segment
   */
  toCommandArray () {
    // Note: FFmpeg options on inputs prepend the -i option
    let cmd = [];
    this.options.forEach((o) => { cmd = cmd.concat(o.toCommandArray()); });
    cmd.push('-i');
    cmd.push(`${this.url}`);
    return cmd;
  }

  /**
   * Generate the command string segment for this FFmpeg input
   * @return {string} the command string segment
   */
  toCommandString () {
    return this.toCommandArray()
      .map((elt) => elt.startsWith('-') ? elt : `"${elt.replace(/\"/g, '\\"')}"`)
      .join(' ');
  }

  /**
   * Validate the options passed into the constructor
   * @param {Object} options - the options for the input
   * @return {Array<FFmpegOption>} array of validated FFmpegOption objects
   */
  static validateOptions (options) {
    // TODO: validate input options here
    logger.info(`Validating options: ${JSON.stringify(options)}`);
    let opts = options;
    if (!(opts instanceof Map)) {
      opts = new Map(Object.entries(options));
    }
    const ctx = FFmpegOption.FFmpegOptionContexts.INPUT;
    const optObjects = Array.from(opts)
      .map(([name, arg]) => new FFmpegOption(name, ctx, arg));
    logger.info(`Completed validating options: ${JSON.stringify(optObjects)}`);
    return (optObjects);
  }
}

module.exports = FFmpegInput;
