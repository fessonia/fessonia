/**
 * FFmpeg Input module.
 * @module ffmpeg_option
 */

/** Class representing an FFmpeg option */
class FfmpegOption {
  /**
   * Create an option for an FFmpeg command
   * @param {Object} args - the options for the input 
   * @param {FFmpegOption.FFmpegOptionContexts} context - (optional) the context in which to apply the option
   */
  constructor (args = {}, context = null) {
    FFmpegOption.validateArguments(args);
    this.args = args;
  }

  /**
   * Generate the command string segment for this FFmpeg option
   * @return {string} the command string segment
   */
  toCommandString () {
    // TODO: implement
  }

  /**
   * Validate arguments passed in for this FFmpeg option
   * @param {Object} args - the arguments for the FFmpeg option
   * @return {boolean} whether the arguments passed validation
   */
  validateArguments (args) {
    // TODO: implement
  }
}

FFmpegOption.FFmpegOptionContexts = {
  GLOBAL: 0,
  INPUT: 1,
  OUTPUT: 2
};

module.exports = FfmpegOption;
