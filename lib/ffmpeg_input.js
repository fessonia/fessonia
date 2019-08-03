/**
 * @fileOverview lib/ffmpeg_input.js - Defines and exports the FFmpegInput class
 */

const config = new require('./util/config')(),
  logger = config.logger('FFmpegInput');

/**
 * Class representing an FFmpeg input file (`-i`)
 */
class FFmpegInput {
  /**
   * Create an input for an FFmpeg command
   * @param {string|FilterNode|FilterGraph} url - the address of the input file, or a filter object to use as input
   * @param {Object} options - the options for the input
   *
   * @property {Object} url - the url for the input, post-validation
   * @property {Object} options - the options for the input, post-validation
   */
  constructor (url, options = new Map()) {
    const urlValidation = FFmpegInput.validateUrl(url);
    for (let key of Object.getOwnPropertyNames(urlValidation)) {
      this[key] = urlValidation[key];
    }
    if (!this.hasOwnProperty('tracks')) {
      FFmpegInput._interrogateForTracks(url);
    }
    logger.info(`Pre-validation: ${logger.format(options)}`);
    this.options = FFmpegInput.validateOptions(options);
    logger.info(`Post-validation: ${logger.format(this.options)}`);
    this._inputLabel = null;
  }

  /**
   * Return the label for this input object.
   * @returns {string} - the label defined on this object.
   */
  get inputLabel () {
    if (this._inputLabel === null) {
      logger.warn(`Attempt to retrieve inputLabel before one was set on ${logger.format(this)}`);
      return undefined;
    }
    return this._inputLabel;
  }

  /**
   * Set the label for this input object.
   * @param {string} newLabel - the new value for the label for this input object.
   */
  set inputLabel (newLabel) {
    const isString = typeof newLabel === 'string';
    const hasToString = newLabel.toString && typeof newLabel.toString === 'function';
    logger.info(`Setting inputLabel: newLabel = ${logger.format(newLabel)}, isString = ${logger.format(isString)}, hasToString = ${logger.format(hasToString)}, this._inputLabel = ${logger.format(this._inputLabel)}`);
    if (isString || hasToString) {
      if (this._inputLabel !== null) {
        logger.warn(`Resetting existing inputLabel value ${this._inputLabel} on ${logger.format(this)} to new inputLabel value ${newLabel}.`);
      }
      if (isString) {
        this._inputLabel = newLabel;
      }
      if (hasToString) {
        logger.warn(`Stringifying new inputLabel value for ${logger.format(this)}`);
        this._inputLabel = newLabel.toString();
      }
    } else {
      throw new Error('Invalid parameter: unable to stringify value of newLabel.');
    }
  }

  /**
   * Mark a track/stream on this input as mapped
   * @param {number} track - the track index to mark as mapped
   * @returns {void}
   */
  markTrackMapped (track) {
    if (typeof track !== 'number') {
      throw new Error(`Expected numeric value for track parameter, but got ${typeof track}: ${logger.format(track)}`);
    }
    if (this.tracks[track].mapped) {
      throw new Error(`Requested track on input ${logger.format(this)} already mapped.`);
    }
    this.tracks[track].mapped = true;
  }

  /**
   * Get next available unmapped track, optionally specifying streamType
   * @param {null|Object} options - an options object
   * @returns {number} - the track number
   */
  nextAvailableOutputTrack (options = null) {
    if (options !== null && options.hasOwnProperty('streamType')) {
      this.tracks.forEach((track, index) => {
        if (track.streamType === options.streamType && !track.mapped) {
          return index;
        }
      });
      throw new Error(`No available track of type '${options.streamType}' found on ${logger.format(this)}.`);
    }
    this.tracks.forEach((track, index) => {
      if (!track.mapped) return index;
    });
    throw new Error(`No available track found on ${logger.format(this)}.`);
  }

  /**
   * Generate the command array segment for this FFmpeg input
   * @returns {Array} the command array segment
   */
  toCommandArray () {
    // Note: FFmpeg options on inputs prepend the -i option
    let cmd = [];
    this.options.forEach((o) => { cmd = cmd.concat(o.toCommandArray()); });
    cmd.push('-i');
    cmd.push(`${this.url}`);
    return cmd;
  }

  /**
   * Generate the command string segment for this FFmpeg input
   * @returns {string} the command string segment
   */
  toCommandString () {
    return this.toCommandArray()
      .map((elt) => elt.startsWith('-') ? elt : `"${elt.replace(/\"/g, '\\"')}"`)
      .join(' ');
  }

  /**
   * Generate a developer-friendly string representing for this FFmpeg input
   * @returns {string} the string representation
   */
  toString () {
    return `FFmpegInput(url: "${this.url}", options: ${logger.format(this.options)})`;
  }

  /**
   * Generate a developer-friendly string representing for this FFmpeg input
   * @returns {string} the string representation
   */
  inspect () {
    return this.toString();
  }

  /**
   * Validate the url passed into the constructor
   * @param {string|FilterNode|FilterGraph} url - the url for the input
   * @returns {Object} results of the validation; errors if invalid
   */
  static validateUrl (url) {
    if (!url) {
      throw new Error('Invalid arguments: url parameter is required');
    }
    const result = {};
    if (typeof url !== 'string') {
      const FilterNode = FFmpegInput._loadFilterNode();
      const FilterGraph = FFmpegInput._loadFilterGraph();
      if (url instanceof FilterNode || url instanceof FilterGraph) {
        result.filterObject = url;
        if (url instanceof FilterNode) {
          result.filterType = 'FilterNode';
        } else if (url instanceof FilterGraph) {
          result.filterType = 'FilterGraph';
        }
        result.url = url.toString();
        logger.info(`Received filter object of type ${result.filterType} as input: converting object ${logger.format(url)} to string representation: "${result.url}"`);
      } else {
        throw new Error('Unknown input type: should be filter object or string address of file/URL');
      }
    } else {
      result.url = url;
    }
    return (result);
  }

  /**
   * Validate the options passed into the constructor
   * @param {Object} options - the options for the input
   * @returns {Array<FFmpegOption>} array of validated FFmpegOption objects; errors if invalid
   */
  static validateOptions (options) {
    // TODO: validate input options here
    const FFmpegOption = FFmpegInput._loadFFmpegOption();
    logger.info(`Validating options: ${logger.format(options)}`);
    let opts = options;
    if (!(opts instanceof Map)) {
      logger.info('Validation: opts is not a Map');
      opts = new Map(Object.entries(options));
    }
    logger.info(`Mid-validation: ${logger.format(opts)}`);
    const ctx = FFmpegOption.FFmpegOptionContexts.INPUT;
    const optObjects = Array.from(opts)
      .map(([name, arg]) => new FFmpegOption(name, ctx, arg));
    logger.info(`Completed validating options: ${JSON.stringify(optObjects)}`);
    return (optObjects);
  }

  /**
   * Interrogate file or FilterGraph/FilterNode for output tracks
   * @param {string|FilterNode|FilterGraph} url - the source file or object
   * @returns {Array<Object>} - an array of track info objects
   *
   * @private
   */
  static _interrogateForTracks (url) {
    // TODO: Implement this using ffprobe
    return [];
  }

  /**
   * Load the FilterNode class and return it
   * 
   * @returns {FilterNode} - the FilterNode class
   *
   * @private
   */
  static _loadFilterNode () {
    return require('./filter_node');
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

  /**
   * Load the FFmpegOption class and return it
   * 
   * @returns {FFmpegOption} - the FFmpegOption class
   *
   * @private
   */
  static _loadFFmpegOption () {
    return require('./ffmpeg_option');
  }
}

module.exports = FFmpegInput;
