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
    this.args = this.validateArguments(args);
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
   * Parse the string of arguments provided into a Map object
   * @param {string} argString - the string of arguments passed in
   * @return {Map} the arguments Map object
   */
  parseArgString (argString) {
    const arrOfArrays = argString.split(':').map((arg) => {
      let argArray = arg.split('=');
      if (argArray.length === 1) { argArray.push(null); }
      return (argArray);
    });
    return (new Map(arrOfArrays));
  }

  /**
   * Validate arguments passed in for this FFmpeg option
   * @param {Map} args - the arguments for the FFmpeg option
   * @return {boolean} whether the arguments passed validation
   */
  validateArguments (args) {
    const argsIsMap = (args instanceof Map);
    const argsIsString = (typeof args === 'string');
    const argsIsObj = (typeof args === 'object') && (!Array.isArray(args));
    const argsTypeOk = argsIsMap || argsIsString || argsIsObj;
    if (!argsTypeOk) {
      throw new Error('InvalidArgument: args must be a Map or an object');
    }
    // TODO: implement actual argument name checks
    if (argsIsMap) { return (args); }
    if (argsIsString) { return parseArgString(args); }
    return (new Map(Object.entries(args)));
  }
}

FFmpegOption.FFmpegOptionContexts = OPTION_CONTEXTS;

module.exports = FFmpegOption;
