/**
 * FFmpeg option module.
 * @module ffmpeg_option
 */

const FilterChain = require('./filter_chain');

/* Enumeration of context values */
const OPTION_CONTEXTS = {
  GLOBAL: 0,
  INPUT: 1,
  OUTPUT: 2
};

/* List of option names that refer to filters */
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
 */
class FFmpegOption {
  /**
   * Create an option for an FFmpeg command
   * @param {string} name - the option name
   * @param {FFmpegOption.FFmpegOptionContexts} context - the context in which to apply the option
   * @param {string|FilterChain} arg - the argument for this option (default: null)
   */
  constructor (name, context, arg = null) {
    if (FILTER_OPTIONS.includes(name) && arg instanceof FilterChain) {
      name = 'filter_complex';
      this.filterChain = arg;
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
}

FFmpegOption.FFmpegOptionContexts = OPTION_CONTEXTS;
FFmpegOption.FFmpegFilterOptions = FILTER_OPTIONS;

module.exports = FFmpegOption;
