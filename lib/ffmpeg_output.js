/**
 * FFmpeg Output module.
 * @module ffmpeg_output
 */

/** Class representing an FFmpeg output file */
class FfmpegOutput {
  /**
   * Create an output for an FFmpeg command
   * @param {Object} options - the options for the output 
   */
  constructor (options) {
    FfmpegOutput.validateOptions(options);
    this.options = options;
    this.url = options.file ? options.file : options.url;
  }

  /**
   * Validate the options passed into the constructor
   * @param {Object} options - the options for the output
   * @return {boolean} true if validated
   */
  static validateOptions (options) {
    if (!options.hasOwnProperty('file') && !options.hasOwnProperty('url')) {
      throw new Error('Could not create FfmpegOutput object: options argument missing required property. Must have one of: "file" or "url".');
    }
    return (true);
  }
}

module.exports = FfmpegOutput;
