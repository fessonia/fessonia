/**
 * FFmpeg Input module.
 * @module ffmpeg_input
 */

const config = new require('./util/config')(),
  logger = config.logger;

const FFmpegOption = require('./ffmpeg_option');
const FilterNode = require('./filter_node');
const FilterChain = require('./filter_chain');

/** Class representing an FFmpeg input file (`-i`) */
class FFmpegInput {
  /**
   * Create an input for an FFmpeg command
   * @param {string|FilterNode|FilterChain} url - the address of the input file, or a filter object to use as input
   * @param {Object} options - the options for the input 
   */
  constructor (url, options = new Map()) {
    const urlValidation = FFmpegInput.validateUrl(url);
    for (let key of Object.getOwnPropertyNames(urlValidation)) {
      this[key] = urlValidation[key];
    }
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
   * Validate the url passed into the constructor
   * @param {string} url - the url for the input
   * @return {Object} results of the validation; errors if invalid
   */
  static validateUrl (url) {
    if (!url) {
      throw new Error('Invalid arguments: url parameter is required');
    }
    const result = {};
    if (typeof url !== 'string') {
      if (url instanceof FilterNode || url instanceof FilterChain) {
        result.filterObject = url;
        if (url instanceof FilterNode) {
          result.filterType = 'FilterNode';
        } else if (url instanceof FilterChain) {
          result.filterType = 'FilterChain';
        }
        result.url = url.toString();
        logger.info(`Received filter object of type ${result.filterType} as input: converting to string representation: "${result.url}"`);
      } else {
        throw new Error('Unknown input type: should be filter object or string address of file/URL');
      }
    } else {
      result.url = url;
    }
    return (result);
  }

  /**
   * Validate the options passed into the constructor
   * @param {Object} options - the options for the input
   * @return {Array<FFmpegOption>} array of validated FFmpegOption objects; errors if invalid
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
