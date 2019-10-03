/**
 * @fileOverview lib/ffmpeg_option.js - Defines and exports the FFmpegOption class
 * 
 * @private
 */

const util = require('util');

/**
 * Enumeration of option context values
 *
 * @private
 */
const OPTION_CONTEXTS = {
  GLOBAL: 0,
  INPUT: 1,
  OUTPUT: 2
};

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
   * @param {FFmpegOption.FFmpegOptionContexts} context - the context in which to apply the option
   * @param {string|FilterNode|FilterChain|FilterGraph} arg - the argument for this option (default: null)
   */
  constructor(name, context, arg = null) {
    const FilterGraph = FFmpegOption._loadFilterGraph();
    arg = FilterGraph.wrap(arg)
    const isFilterArg = arg instanceof FilterGraph;
    if (FILTER_OPTIONS.includes(name) && isFilterArg) {
      name = 'filter_complex';
      this.filterGraph = arg;
      arg = arg.toString();
      context = FFmpegOption.FFmpegOptionContexts.GLOBAL;
    }
    const validated = this.validate(name, context, arg);
    this.name = validated.name;
    this.optionName = `-${validated.name}`;
    this.arg = validated.arg;
    this.context = validated.context;
  }

  /**
   * Generate the command array segment for this FFmpeg option
   * @return {Array} the command array segment
   */
  toCommandArray () {
    if (this.arg === null) { return [this.optionName]; }
    return [this.optionName, this.arg];
  }

  /**
   * Generate the command string segment for this FFmpeg option
   * @return {string} the command string segment
   */
  toCommandString () {
    if (this.arg === null) { return this.optionName; }
    return `${this.optionName} ${this.arg}`;
  }

  /**
   * Generate a developer-friendly string representing for this FFmpeg option
   * @param {number} depth - inspect depth: @see util.inspect
   * @param {Object} opts - inspect options: @see util.inspect
   * @returns {string} the string representation
   */
  [util.inspect.custom](depth, opts) {
    const context = `FFmpegOption.FFmpegOptionContexts.${['GLOBAL', 'INPUT', 'OUTPUT'][this.context]} (=== ${this.context})`;
    return util.inspect({
      ...this,
      context: context
    }, false, depth, opts.color ? opts.color : true);
  }

  /**
   * Validate input for this FFmpeg Option
   * @param {string} name - the option name
   * @param {FFmpegOption.FFmpegOptionContexts} context - the context in which to apply the option
   * @param {string} arg - the argument for this option
   * 
   * @returns {Object} - validated values; throws error if invalid
   */
  validate (name, context, arg) {
    if (!Object.values(FFmpegOption.FFmpegOptionContexts).includes(context)) {
      throw new Error('InvalidArgument: context must be one of the enumerations of FFmpegOption.FFmpegOptionContexts');
    }
    if (arg === undefined) {
      arg = null;
    }
    if (typeof arg !== 'string' && arg !== null) {
      if (arg instanceof Map || Array.isArray(arg)) {
        throw new Error('InvalidArgument: arg must be a string value or null, or must be a single-value type and have a toString method');
      } else if (arg.toString !== undefined && typeof arg.toString === 'function' && arg.toString() !== '[object Object]') {
        arg = arg.toString();
      } else {
        throw new Error('InvalidArgument: arg must be a string value or null, or must have a toString method');
      }
    }
    // TODO: validate that option name is valid for given context (via FFmpeg help)
    // TODO: validate that arg value is valid for option name
    return {
      name: name,
      context: context,
      arg: arg
    };
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

FFmpegOption.FFmpegOptionContexts = OPTION_CONTEXTS;
FFmpegOption.FFmpegFilterOptions = FILTER_OPTIONS;

module.exports = FFmpegOption;
