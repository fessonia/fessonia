/**
 * FFmpeg option module.
 * @module ffmpeg_option
 */

const FilterChain = require('./filter_chain');

OPTION_CONTEXTS = {
  GLOBAL: 0,
  INPUT: 1,
  OUTPUT: 2
};

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
   * @param {string} arg - the argument for this option (default: null)
   */
  constructor (name, context, arg = null) {
    if ((name === 'filter' || name === 'filter_complex') && arg instanceof FilterChain) {
      name = 'filter_complex';
      this.filterChain = arg;
      arg = arg.toString();
    }
    this.validate(name, context, arg);
    this.name = name;
    this.optionName = `-${name}`;
    this.arg = arg;
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
   * @returns {boolean} - true if valid; throws error if invalid
   */
  validate (name, context, arg) {
    if (!Object.values(FFmpegOption.FFmpegOptionContexts).includes(context)) {
      throw new Error('InvalidArgument: context must be one of the enumerations of FFmpegOption.FFmpegOptionContexts');
    }
    if (typeof arg !== 'string' && arg !== null) {
      throw new Error('InvalidArgument: arg must be a string value or null');
    }
    // TODO: validate that option name is valid for given context (via FFmpeg help)
    // TODO: validate that arg value is valid for option name
    return true;
  }
}

FFmpegOption.FFmpegOptionContexts = OPTION_CONTEXTS;

module.exports = FFmpegOption;
