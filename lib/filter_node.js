const crypto = require('crypto');

const config = new require('./util/config')(),
  logger = config.logger('FilterNode');

/** Class representing a single node in an FFmpeg filter graph */
class FilterNode {
  /**
   * Create a filter for use in an FFmpeg filter graph
   * @param {Object} options - the options for the filter 
   */
  constructor (options) {
    this.ffmpegFilterInfo = undefined;
    this.filterIOType = undefined;
    this.inputType = undefined;
    this.outputType = undefined;
    this.inputsMapped = undefined;
    this.outputsMapped = undefined;
    this.timelineSupport = undefined;
    this.sliceThreading = undefined;
    this.commandSupport = undefined;

    if (!FilterNode._initialized) { FilterNode.initialize(); }
    this._configureFilter(options);

    this.padPrefix = `${this.options.filterName}_${this._digest(true).substring(0,12)}`;
    return this;
  }

  /**
   * Initialize the validation data for this class
   * @return {void} no return value
   */
  static initialize () {
    FilterNode.ValidFilters = FilterNode._getValidFilterInfoFromFFmpeg();
    FilterNode._initialized = true;
  }

  /**
   * Generate the argument string defining this FFmpeg filter node
   * @return {string} the filter argument string
   */
  toString () {
    return (this.options.filterName + this._processFilterArguments(this.options.args));
  }

  /**
   * Generate a developer-friendly string defining this FFmpeg filter node
   * for use in logging and debugging
   * @return {string} the filter argument string
   */
  inspect () {
    return `FilterNode(${this.padPrefix}: '${this.toString()}')`;
  }

  /**
   * Mark the specified input pad as mapped
   * @param {number} padIndex the input pad index to mark
   * 
   * @returns {void}
   */
  markInputPadMapped (padIndex) {
    if (typeof padIndex !== 'number') {
      throw new Error(`Non-numeric input pad index ${padIndex} specified for FilterNode ${logger.format(this)}.`);
    }
    if (padIndex < 0 || padIndex >= this.inputsCount) {
      throw new Error(`Invalid input pad index ${padIndex} specified for FilterNode ${logger.format(this)} with ${this.inputsCount} input pads.`);
    }
    this.inputsMapped[padIndex] = true;
  }

  /**
   * Mark the specified output pad as mapped
   * @param {number} padIndex the output pad index to mark
   * 
   * @returns {void}
   */
  markOutputPadMapped (padIndex) {
    if (typeof padIndex !== 'number') {
      throw new Error(`Non-numeric output pad index ${padIndex} specified for FilterNode ${logger.format(this)}.`);
    }
    if (padIndex < 0 || padIndex >= this.outputsCount) {
      throw new Error(`Invalid output pad index ${padIndex} specified for FilterNode ${logger.format(this)} with ${this.outputsCount} output pads.`);
    }
    this.outputsMapped[padIndex] = true;
  }

  /**
   * Get the next unmapped input pad on this filter node
   * 
   * @returns {number} input pad index
   */
  nextAvailableInputPadIndex () {
    return this.inputsMapped.findIndex((isMapped) => !isMapped);
  }

  /**
   * Get the next unmapped output pad on this filter node
   * 
   * @returns {number} output pad index
   */
  nextAvailableOutputPadIndex () {
    return this.outputsMapped.findIndex((isMapped) => !isMapped);
  }

  // Helper functions

  /**
   * Create MD5 hash of filter for pad prefix
   * @param {boolean} salt - set true if digest should be salted for uniqueness (default: false)
   * @return {string} the hash string in hex of the filter
   *
   * @private
   */
  _digest (salt = false) {
    let saltString = '';
    if (salt) {
      const B = 1000000000;
      saltString += Date.now().toString();
      saltString += Math.floor(B + B * Math.random()).toString();
    }
    const digest = crypto
      .createHash('md5')
      .update(this.toString() + saltString)
      .digest('hex');
    return (digest);
  }

  /**
   * Validate the options object used to create a filter node
   * @param {Object} options - the options for the input
   * 
   * @returns {Object} - returns options passed in if no error
   *
   * @private
   */
  _validateOptions (options) {
    if (!options.hasOwnProperty('filterName')) {
      const errMsg = `FilterNode ${logger.format(this)} options object does not specify a 'filterName' property. Please supply a value for options.filterName when creating the FilterNode.`;
      logger.error(errMsg);
      throw new Error(errMsg);
    }
    const info = FilterNode.ValidFilters[options.filterName];
    if (!info) {
      logger.warn(`FilterNode ${logger.format(this)} options object specifies unknown value for 'filterName' property. Please ensure that your FFmpeg installation understands the filter name. You can see what filters FFmpeg knows about with: ffmpeg -filters`);
    }
    if (info) {
      let pads;
      switch (info.inputPads) {
      case undefined:
      case null:
        throw new Error('No input pad information retrieved with filter data from FFmpeg for filter: ' + this.inspect());
      case '|':
        this.inputType = info.inputPads;
        this.inputs = null;
        this.inputsCount = 0;
        this.inputsMapped = null;
        if (!!options.inputsCount && options.inputsCount !== this.inputsCount) {
          throw new Error('Invalid inputsCount option specified for source filter:' + this.inspect());
        }
        break;
      case 'N':
        this.inputType = info.inputPads;
        if (!options.inputsCount) {
          this.inputs = [];
          this.inputsCount = null;
          this.inputsMapped = [];
          throw new Error('Missing inputsCount option for variable-input filter: ' + this.inspect());
        }
        this.inputs = Array(options.inputsCount).fill('N');
        this.inputsCount = options.inputsCount;
        this.inputsMapped = Array(options.inputsCount).fill(false);
        break;
      default:
        pads = info.inputPads.split('');
        this.inputType = info.inputPads;
        this.inputs = pads;
        this.inputsCount = pads.length;
        this.inputsMapped = Array(pads.length).fill(false);
        if (!!options.inputsCount && options.inputsCount !== this.inputsCount) {
          throw new Error('Invalid inputsCount option for fixed-cardinality inputs filter: ' + this.inputsCount);
        }
      }
      switch (info.outputPads) {
      case undefined:
      case null:
        throw new Error('No output pad information retrieved with filter data from FFmpeg for filter: ' + this.inspect());
      case '|':
        this.outputType = info.outputPads;
        this.outputs = null;
        this.outputsCount = 0;
        this.outputsMapped = null;
        if (!!options.outputsCount && options.outputsCount !== this.outputsCount) {
          throw new Error('Invalid outputsCount option specified for sink filter:' + this.inspect());
        }
        break;
      case 'N':
        this.outputType = info.outputPads;
        if (!options.outputsCount) {
          this.outputs = [];
          this.outputsCount = null;
          this.outputsMapped = [];
          throw new Error('Missing outputsCount option for variable-output filter: ' + this.inspect());
        }
        this.outputs = Array(options.outputsCount).fill('N');
        this.outputsCount = options.outputsCount;
        this.outputsMapped = Array(options.outputsCount).fill(false);
        break;
      default:
        pads = info.inputPads.split('');
        this.outputType = info.outputPads;
        this.outputs = pads;
        this.outputsCount = pads.length;
        this.outputsMapped = Array(pads.length).fill(false);
        if (!!options.outputsCount && options.outputsCount !== this.outputsCount) {
          throw new Error('Invalid outputsCount option for fixed-cardinality outputs filter: ' + this.outputsCount);
        }
      }
    }
    if (options.hasOwnProperty('args')) {
      this._processFilterArguments(options.args);
    }
    return options;
  }

  /**
   * Configure the filter node based on the options provided
   * @param {Object} options - the options for the input
   * 
   * @returns {ThisType} - returns itself (this)
   *
   * @private
   */
  _configureFilter (options) {
    this.options = this._validateOptions(options);
    const ffmpegFilter = FilterNode.ValidFilters[options.filterName];
    this.ffmpegFilterInfo = ffmpegFilter;
    this.filterIOType = FilterNode._getFilterIOType(ffmpegFilter);
    return this;
  }

  /**
   * Generate the FFmpeg-formatted arguments for the filter node
   * @param {Array} args - the filter arguments
   * 
   * @returns {string} - the FFmpeg-formatted arguments string
   *
   * @private
   */
  _processFilterArguments (args) {
    if (!args) { return (''); }
    let argterms = [], kvargs = [];
    for (let arg of args) {
      switch (typeof arg) {
      case 'object':
        if (arg.hasOwnProperty('name') && arg.hasOwnProperty('value')) {
          kvargs.push(`${arg.name}=${FilterNode._handleArrayArguments(arg.value)}`);
        } else if (Array.isArray(arg)) {
          argterms.push(FilterNode._handleArrayArguments(arg));
        } else {
          throw new Error(`Invalid argument ${logger.format(arg)} of FilterNode ${logger.format(this)}. Filter arguments should be either a string or an object with keys 'name' and 'value', or in rare cases, an Array.`);
        }
        break;
      case 'string':
      case 'number':
        argterms.push(arg);
        break;
      default:
        throw new Error(`Invalid argument ${logger.format(arg)} of FilterNode ${logger.format(this)}. Filter arguments should be either a string or an object with keys 'name' and 'value', or in rare cases, an Array.`);
      }
    }
    return('=' + (argterms.concat(kvargs).join(':')));
  }

  /**
   * Process Array-valued arguments to a filter
   * @param {Object} arg - the Array-valued argument data
   * 
   * @returns {string} - a the arguments sub-string for the Array-valued argument value
   *
   * @private
   */
  static _handleArrayArguments (arg) {
    if (typeof arg === 'object' && Array.isArray(arg)) { return arg.join('|'); }
    return arg;
  }

  /**
   * Set the FFmpeg filter I/O type (source, sink or generic)
   * @param {Object} ffmpegFilter - filter info pulled from FFmpeg
   * 
   * @returns {string} - a value from FFmpegEnumerations.FilterIOTypes
   *
   * @private
   */
  static _getFilterIOType (ffmpegFilter) {
    const FFmpegEnumerations = FilterNode._loadFFmpegEnumerations();
    if (ffmpegFilter && ffmpegFilter.source) {
      return FFmpegEnumerations.FilterIOTypes.SOURCE;
    }
    if (ffmpegFilter && ffmpegFilter.sink) {
      return FFmpegEnumerations.FilterIOTypes.SINK;
    }
    return FFmpegEnumerations.FilterIOTypes.GENERIC;
  }

  /**
   * Query the local installation of FFmpeg to get available filters
   * 
   * @returns {Object} - an object of filter information for each available filter, keyed by filter name
   *
   * @private
   */
  static _queryFFmpegForFilters () {
    const childProcess = require('child_process'),
      execFileSync = childProcess.execFileSync;
    let ffmpeg_binary = config.ffmpeg_bin,
      ffmpeg_args = ['-filters'];
    if (!ffmpeg_binary) {
      throw new Error(`No ffmpeg binary found in config: '${ffmpeg_binary}'`);
    }
    if (Array.isArray(ffmpeg_binary)) {
      ffmpeg_binary = ffmpeg_binary[0];
      ffmpeg_args = config.ffmpeg_bin.slice(1).concat(ffmpeg_args);
    }
    const out = execFileSync(ffmpeg_binary, ffmpeg_args, {});
    return out;
  }

  /**
   * Parse output from `ffmpeg -filters`
   * 
   * @returns {Object} - an object of filter information for each available filter, keyed by filter name
   *
   * @private
   */
  static _getValidFilterInfoFromFFmpeg () {
    const filters = {};
    const out = FilterNode._queryFFmpegForFilters();
    const pattern = /\s(T|\.)(S|\.)(C|\.)\s([a-z0-9_]+)\s+([VA]+|N|\|)\-\>([VA]+|N|\|)\s+(.*)/;
    let t, s, c, n, i, o, d;
    out.toString().split('\n').forEach(function (line) {
      [, t, s, c, n, i, o, d] = line.match(pattern) || [];
      if (!!n) {
        filters[n] = {
          name: n,
          timelineSupport: t === 'T',
          sliceThreading: s === 'S',
          commandSupport: c === 'C',
          source: i === '|',
          sink: o === '|',
          inputPads: i,
          outputPads: o,
          description: d
        };
      }
    });
    return (filters);
  }

  /**
   * Load the FFmpegEnumerations class and return it
   * 
   * @returns {FFmpegEnumerations} - the FFmpegEnumerations class
   *
   * @private
   */
  static _loadFFmpegEnumerations () {
    return require('./ffmpeg_enumerations');
  }
}

/**
 * Enumeration of FFmpeg known filters completed?
 *
 * @private
 */
FilterNode._initialized = false;

module.exports = FilterNode;
