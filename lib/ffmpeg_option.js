/**
 * @fileOverview lib/ffmpeg_option.js - Defines and exports the FFmpegOption class
 *
 * @private
 */

const util = require('util');

/**
 * List of option names that refer to filters
 *
 * @private
 */
const FILTER_OPTIONS = [
  'filter',
  'filter:v',
  'vf',
  'filter:a',
  'af',
  'filter_complex',
  'lavfi'
];

/**
 * Class representing an FFmpeg option
 *
 * NOTE: This class is for internal use, intended for validation and
 * serialization of options added to an FFmpeg command. It is not
 * intended for use as a library interface to other code.
 *
 * @private
 */
class FFmpegOption {
  /**
   * Create an option for an FFmpeg command
   * @param {string} name - the option name
   * @param {string|FilterNode|FilterChain|FilterGraph} arg - the argument for this option (default: null)
   */
  constructor(name, arg = null) {
    this.validate(name, arg);
    const FilterGraph = FFmpegOption._loadFilterGraph();
    if (FILTER_OPTIONS.includes(name) && FilterGraph.wrap(arg) instanceof FilterGraph) {
      name = 'filter_complex';
    }
    if (arg === undefined) {
      arg = null;
    }
    this.name = name;
    this.optionName = `-${name}`;
    this.arg = arg;
  }

  /**
   * Generate the command array segment for this FFmpeg option
   * @returns {Array} the command array segment
   */
  toCommandArray () {
    if (this.arg === null) {
      return [this.optionName];
    }
    return [this.optionName, this.arg.toString()];
  }

  /**
   * Generate the command string segment for this FFmpeg option
   * @returns {string} the command string segment
   */
  toCommandString () {
    if (this.arg === null) {
      return this.optionName;
    }
    return `${this.optionName} ${this.arg.toString()}`;
  }

  /**
   * Generate a developer-friendly string representing for this FFmpeg option
   * @param {number} depth - inspect depth: @see util.inspect
   * @param {Object} opts - inspect options: @see util.inspect
   * @returns {string} the string representation
   */
  [util.inspect.custom](depth, opts) {
    return util.inspect(this, false, depth, opts.color ? opts.color : true);
  }

  /**
   * Validate input for this FFmpeg Option
   * @param {string} name - the option name
   * @param {string} arg - the argument for this option
   *
   * @returns {Object} - validated values; throws error if invalid
   */
  validate (name, arg) {
    if (typeof arg !== 'string' && arg !== null) {
      if (arg instanceof Map || Array.isArray(arg)) {
        throw new Error('InvalidArgument: arg must be a string value or null, or must be a single-value type and have a toString method');
        // if toString does not exist or is useless
      } else if (!(arg.toString !== undefined && typeof arg.toString === 'function')) {
        throw new Error('InvalidArgument: arg must be a string value or null, or must have a toString method');
      }
    }

    return true;
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
}

FFmpegOption.FFmpegFilterOptions = FILTER_OPTIONS;

module.exports = FFmpegOption;
