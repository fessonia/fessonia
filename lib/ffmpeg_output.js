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
   * Generate the command string segment for this FFmpeg output
   * @return {string} the command string segment
   */
  toCommandString () {
    let cmd = `"${this.url}"`;
    Object.keys(this.options)
      .filter((k) => this.options.hasOwnProperty(k))
      .filter((k) => k !== 'file' && k !== 'url')
      .forEach((opt) => {
        // Note: FFmpeg options on inputs prepend the output filename
        cmd = `-${opt} ${this.options[opt]} ${cmd}`;
      });
    return cmd;
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
