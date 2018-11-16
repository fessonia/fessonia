/**
 * FFmpeg option module.
 * @module ffmpeg_option
 */

/** Class representing an FFmpeg option */
class FFmpegOption {
  /**
   * Create an option for an FFmpeg command
   * @param {string} name - the option name
   * @param {FFmpegOption.FFmpegOptionContexts} context - the context in which to apply the option
   * @param {Object} args - the options for the input (default: {unordered: [], keyValue: {}})
   */
  constructor (name, context, args = {unordered: [], keyValue: {}}) {
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
    let argString = this.unordered.join(':');
    Object.keys(this.args.keyValue)
      .filter((k) => this.args.keyValue.hasOwnProperty(k))
      .forEach((arg) => {
        argString += `:${arg}=${this.args.keyValue[arg]}`;
      });
    this.args.unordered.concat(cmd);
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
   * @param {Object} args - the arguments for the FFmpeg option
   * @return {boolean} whether the arguments passed validation
   */
  validateArguments (args) {
    // TODO: implement
    if (!(args.hasOwnProperty('unordered') && args.hasOwnProperty('keyValue'))) {
      throw new Error('InvalidArgument: args must have properties "unordered" and "keyValue"');
    }
  }
}

FFmpegOption.FFmpegOptionContexts = {
  GLOBAL: 0,
  INPUT: 1,
  OUTPUT: 2
};

module.exports = FFmpegOption;
