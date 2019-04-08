/**
 * FFmpeg Output module.
 * @module FFmpeg_output
 */

const config = new require('./util/config')(),
  logger = config.logger('FFmpegOutput');

const FFmpegOption = require('./ffmpeg_option');

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
   * Validate the options passed into the constructor
   * @param {Object} options - the options for the output
   * @return {Array<FFmpegOption>} array of validated FFmpegOption objects
   */
  static validateOptions (options) {
    logger.info(`Validating options: ${JSON.stringify(options)}`);
    let opts = options;
    if (!(opts instanceof Map)) {
      opts = new Map(Object.entries(options));
    }
    const ctx = FFmpegOption.FFmpegOptionContexts.OUTPUT;
    const optObjects = Array.from(opts)
      .map(([name, arg]) => new FFmpegOption(name, ctx, arg));
    logger.info(`Completed validating options: ${JSON.stringify(optObjects)}`);
    return (optObjects);
  }
}

module.exports = FFmpegOutput;
