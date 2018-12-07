/**
 * FFmpeg option module.
 * @module ffmpeg_option
 */

OPTION_CONTEXTS = {
  GLOBAL: 0,
  INPUT: 1,
  OUTPUT: 2
};

/** Class representing an FFmpeg option */
class FFmpegOption {
  /**
   * Create an option for an FFmpeg command
   * @param {string} name - the option name
   * @param {FFmpegOption.FFmpegOptionContexts} context - the context in which to apply the option
   * @param {Object} args - the options for the input (default: new Map())
   */
  constructor (name, context, args = new Map()) {
    this.name = name;
    this.optionName = `-${name}`;
    if (!Object.values(FFmpegOption.FFmpegOptionContexts).includes(context)) {
      throw Error('InvalidArgument: context must be one of the enumerations of FFmpegOption.FFmpegOptionContexts');
    }
    this.validateArguments(args);
    this.args = args;
  }

  /**
   * Generate the command array segment for this FFmpeg option
   * @return {Array} the command array segment
   */
  toCommandArray () {
    let argString = '', argArray = [];
    this.args.entries().forEach((arg) => {
      if (arg[1] === null) { argArray.push(arg[0]); }
      else { argArray.push(`${arg[0]}=${arg[1]}`); }
    });
    argString += argArray.join(':');
    return [this.optionName, argString];
  }

  /**
   * Generate the command string segment for this FFmpeg option
   * @return {string} the command string segment
   */
  toCommandString () {
    this.toCommandArray().join(' ');
  }

  /**
   * Validate arguments passed in for this FFmpeg option
   * @param {Map} args - the arguments for the FFmpeg option
   * @return {boolean} whether the arguments passed validation
   */
  validateArguments (args) {
    // TODO: implement
    if (!(args instanceof Map)) {
      throw new Error('InvalidArgument: args must be a Map object');
    }
  }
}

FFmpegOption.FFmpegOptionContexts = OPTION_CONTEXTS;

module.exports = FFmpegOption;
