/**
 * @fileOverview lib/ffmpeg_input.js - Defines and exports the FFmpegInput class
 */

const util = require('util');
const { createCommandString } = require('./util/command_string_creator');

/**
 * Class representing an FFmpeg input file (`-i`)
 */
class FFmpegInput {
  /**
   * Create an input for an FFmpeg command
   * @param {string|FilterNode|FilterChain|FilterGraph} url - the address of the input file, or a filter object to use as input
   * @param {Object} options - the options for the input
   *
   * @property {Object} url - the url for the input, post-validation
   * @property {Object} options - the options for the input, post-validation
   */
  constructor (url, options = new Map()) {
    const urlValidation = FFmpegInput.validateUrl(url);
    for (let key of Object.getOwnPropertyNames(urlValidation)) {
      this[key] = urlValidation[key];
    }
    logger.debug(`Pre-validation: ${util.inspect(options)}`);
    this.options = FFmpegInput.validateOptions(options);
    logger.debug(`Post-validation: ${util.inspect(this.options)}`);
    this._inputLabel = null;
  }

  /**
   * Return the label for this input object.
   * @returns {string} - the label defined on this object.
   */
  get inputLabel () {
    if (this._inputLabel === null) {
      logger.warn(`Attempt to retrieve inputLabel before one was set on ${util.inspect(this)}`);
      return undefined;
    }
    return this._inputLabel;
  }

  /**
   * Set the label for this input object.
   * @param {string} newLabel - the new value for the label for this input object.
   */
  set inputLabel (newLabel) {
    const isString = typeof newLabel === 'string';
    const hasToString = newLabel.toString && typeof newLabel.toString === 'function';
    logger.debug(`Setting inputLabel: newLabel = ${util.inspect(newLabel)}, isString = ${util.inspect(isString)}, hasToString = ${util.inspect(hasToString)}, this._inputLabel = ${util.inspect(this._inputLabel)}`);
    if (isString || hasToString) {
      if (this._inputLabel !== null) {
        logger.warn(`Resetting existing inputLabel value ${this._inputLabel} on ${util.inspect(this)} to new inputLabel value ${newLabel}.`);
      }
      if (isString) {
        this._inputLabel = newLabel;
      }
      if (hasToString) {
        logger.warn(`Stringifying new inputLabel value for ${util.inspect(this)}`);
        this._inputLabel = newLabel.toString();
      }
    } else {
      throw new Error('Invalid parameter: unable to stringify value of newLabel.');
    }
  }

  /**
   * Get a stream specifier for a stream on this input
   * @param {string|number} specifier - the stream specifier (stream index, 'v', 'a', 's', 'd', or 't')
   * @returns {FFmpegStreamSpecifier} - the stream specifier object
   */
  streamSpecifier (specifier) {
    const FFmpegStreamSpecifier = FFmpegInput._loadFFmpegStreamSpecifier()
    return new FFmpegStreamSpecifier(this, specifier)
  }

  /**
   * Generate the command array segment for this FFmpeg input
   * @returns {Array} the command array segment
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
   * @returns {string} the command string segment
   */
  toCommandString () {
    return createCommandString(undefined, this.toCommandArray());
  }

  /**
   * Generate a developer-friendly string representing for this FFmpeg input
   * @returns {string} the string representation
   */
  toString () {
    return `FFmpegInput(url: "${this.url}", options: ${util.inspect(this.options)})`;
  }

  /**
   * Validate the url passed into the constructor
   * @param {string|FilterNode|FilterChain|FilterGraph} url - the url for the input
   * @returns {Object} results of the validation; errors if invalid
   */
  static validateUrl (url) {
    if (!url) {
      throw new Error('Invalid arguments: url parameter is required');
    }
    const result = {};
    if (typeof url !== 'string') {
      const FilterGraph = FFmpegInput._loadFilterGraph();
      url = FilterGraph.wrap(url)
      if (url instanceof FilterGraph) {
        result.filterObject = url;
        result.filterType = 'FilterGraph';
        result.url = url.toString();
        logger.debug(`Received filter object as input: converting object ${util.inspect(url)} to string representation: "${result.url}"`);
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
   * @returns {Array<FFmpegOption>} array of validated FFmpegOption objects; errors if invalid
   */
  static validateOptions (options) {
    const FFmpegOption = FFmpegInput._loadFFmpegOption();
    logger.debug(`Validating options: ${util.inspect(options)}`);
    let opts = options;
    if (!(opts instanceof Map)) {
      logger.debug('Validation: opts is not a Map');
      opts = new Map(Object.entries(options));
    }
    logger.debug(`Mid-validation: ${util.inspect(opts)}`);
    const optObjects = Array.from(opts)
      .map(([name, arg]) => new FFmpegOption(name, arg));
    logger.debug(`Completed validating options: ${JSON.stringify(optObjects)}`);
    return (optObjects);
  }

  /**
   * Load the FilterGraph class and return it
   *
   * @returns {FilterGraph} - the FilterGraph class
   *
   * @private
   */
  static _loadFilterGraph () {
    return require('./filter_graph');
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

  /**
   * Load the FFmpegStreamSpecifier class and return it
   *
   * @returns {FFmpegStreamSpecifier} - the FFmpegStreamSpecifier class
   *
   * @private
   */
  static _loadFFmpegStreamSpecifier () {
    return require('./ffmpeg_stream_specifier');
  }
}

module.exports = FFmpegInput;
