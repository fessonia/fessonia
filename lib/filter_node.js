/**
 * @fileOverview lib/filter_node.js - Defines and exports the FilterNode class
 */

const crypto = require('crypto');
const util = require('util');

const config = new require('./util/config')();
const logger = config.logger;

/** Class representing a single node in an FFmpeg filter graph */
class FilterNode {
  /**
   * Create a filter for use in an FFmpeg filter graph
   * @param {string} filterName - the name of the filter
   * @param {Array<any>} args - the arguments for the filter (default: {})
   * @param {Object} options - options for the FilterNode object (default: {})
   */
  constructor (filterName, args = [], options = {}) {
    this.ffmpegFilterInfo = undefined;
    this.filterIOType = undefined;
    this.inputType = undefined;
    this.outputType = undefined;
    this.timelineSupport = undefined;
    this.sliceThreading = undefined;
    this.commandSupport = undefined;

    if (!FilterNode._initialized) {
      FilterNode.initialize();
    }
    this._configureFilter(filterName, args, options);

    this.padPrefix = `${filterName}_${this._digest(true).substring(0,12)}`;
    return this;
  }

  /**
   * Initialize the validation data for this class
   * @returns {void} no return value
   */
  static initialize () {
    FilterNode.ValidFilters = FilterNode._getValidFilterInfoFromFFmpeg();
    FilterNode._initialized = true;
  }

  /**
   * Generate the argument string defining this FFmpeg filter node
   * @returns {string} the filter argument string
   */
  toString () {
    return (this.filterName + this.argsString);
  }

  /**
   * Generate a developer-friendly string defining this FFmpeg filter node
   * for use in logging and debugging
   * @param {number} depth - inspect depth: @see util.inspect
   * @param {Object} opts - inspect options: @see util.inspect
   * @returns {string} the filter argument string
   */
  [util.inspect.custom] (depth, opts) {
    return `FilterNode(${this.padPrefix}: '${this.toString()}')`;
  }

  /**
   * Get the output pad label based on the specifier
   * @param {number|string} specifier the output pad specifier
   * @returns {string} - the output pad label
   */
  getOutputPad (specifier) {
    return `${this.padPrefix}_${this.getOutputPadIndex(specifier)}`;
  }

  /**
   * Get the output pad index based on the specifier
   * @param {number|string} specifier the output pad specifier
   * @returns {number} - the output pad index
   */
  getOutputPadIndex (specifier) {
    let padIndex;
    if (typeof specifier === 'number') {
      padIndex = specifier;
    }
    if (typeof specifier === 'string' && /^\d+$/.test(specifier)) {
      padIndex = parseInt(specifier, 10);
    }
    if (typeof padIndex === 'number' && padIndex >= 0 && padIndex < this.outputsCount) {
      return padIndex;
    }
    throw new Error(`Unable to find output pad matching specifier value ${specifier} for FilterNode ${util.inspect(this)} with ${this.outputsCount} output pads.`);
  }

  /**
   * Create MD5 hash of filter for pad prefix
   * @param {boolean} salt - set true if digest should be salted for uniqueness (default: false)
   * @returns {string} the hash string in hex of the filter
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
   * @param {string} filterName - the filterName for the filter
   * @param {Object} args - the arguments for the filter
   * @param {Object} options - the options for the FilterNode object
   *
   * @returns {Object} - returns object with all arguments passed in if no error
   *
   * @private
   */
  _validateOptions (filterName, args, options) {
    const validated = {};
    if (!filterName) {
      const errMsg = 'FilterNode constructor requires a filterName parameter. Please supply a value for filterName when creating the FilterNode.';
      throw new Error(errMsg);
    }
    const info = FilterNode.ValidFilters[filterName];
    if (!info) {
      logger.warn('Unknown value for filterName parameter. Please ensure that your FFmpeg installation understands the filter name. You can see what filters FFmpeg knows about with: ffmpeg -filters');
    }
    validated.filterName = filterName;
    if (info) {
      let pads;
      switch (info.inputPads) {
      case undefined:
      case null:
        throw new Error('No input pad information retrieved with filter data from FFmpeg for filter: ' + util.inspect(this));
      case '|':
        this.inputType = info.inputPads;
        this.inputs = null;
        this.inputsCount = 0;
        if (!!options.inputsCount && options.inputsCount !== this.inputsCount) {
          throw new Error('Invalid inputsCount option specified for source filter:' + util.inspect(this));
        }
        break;
      case 'N':
        this.inputType = info.inputPads;
        if (!options.inputsCount) {
          this.inputs = [];
          this.inputsCount = null;
          throw new Error('Missing inputsCount option for variable-input filter: ' + util.inspect(this));
        }
        this.inputs = Array(options.inputsCount).fill('N');
        this.inputsCount = options.inputsCount;
        break;
      default:
        pads = info.inputPads.split('');
        this.inputType = info.inputPads;
        this.inputs = pads;
        this.inputsCount = pads.length;
        if (!!options.inputsCount && options.inputsCount !== this.inputsCount) {
          throw new Error('Invalid inputsCount option for fixed-cardinality inputs filter: ' + this.inputsCount);
        }
      }
      switch (info.outputPads) {
      case undefined:
      case null:
        throw new Error('No output pad information retrieved with filter data from FFmpeg for filter: ' + util.inspect(this));
      case '|':
        this.outputType = info.outputPads;
        this.outputs = null;
        this.outputsCount = 0;
        if (!!options.outputsCount && options.outputsCount !== this.outputsCount) {
          throw new Error('Invalid outputsCount option specified for sink filter:' + util.inspect(this));
        }
        break;
      case 'N':
        this.outputType = info.outputPads;
        if (!options.outputsCount) {
          this.outputs = [];
          this.outputsCount = null;
          throw new Error('Missing outputsCount option for variable-output filter: ' + util.inspect(this));
        }
        this.outputs = Array(options.outputsCount).fill('N');
        this.outputsCount = options.outputsCount;
        break;
      default:
        pads = info.inputPads.split('');
        this.outputType = info.outputPads;
        this.outputs = pads;
        this.outputsCount = pads.length;
        if (!!options.outputsCount && options.outputsCount !== this.outputsCount) {
          throw new Error('Invalid outputsCount option for fixed-cardinality outputs filter: ' + this.outputsCount);
        }
      }
    }
    validated.options = options;
    if (args) {
      validated.argsString = this._processFilterArguments(args);
    }
    validated.args = args;
    return validated;
  }

  /**
   * Configure the filter node based on the options provided
   * @param {string} filterName - the name of the filter
   * @param {Object} args - the args for the filter
   * @param {Object} options - the options for the FilterNode object
   *
   * @returns {ThisType} - returns itself (this)
   *
   * @private
   */
  _configureFilter (filterName, args, options) {
    const validated = this._validateOptions(filterName, args, options);
    this.filterName = validated.filterName;
    this.args = validated.args;
    this.argsString = validated.argsString;
    this.options = validated.options;
    const ffmpegFilter = FilterNode.ValidFilters[filterName];
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
    if (Array.isArray(args)) {
      for (let arg of args) {
        switch (typeof arg) {
        case 'object':
          if (Array.isArray(arg)) {
            argterms.push(FilterNode._handleArrayArguments(arg));
          } else {
            for (let key of Object.getOwnPropertyNames(arg)) {
              kvargs.push(`${key}=${FilterNode._handleArrayArguments(arg[key])}`);
            }
          }
          break;
        case 'string':
        case 'number':
          argterms.push(arg);
          break;
        default:
          throw new Error(`Invalid argument ${util.inspect(arg)} of FilterNode ${util.inspect(this)}. Filter arguments should be either a string or an object with keys 'name' and 'value', or in rare cases, an Array.`);
        }
      }
    } else {
      for (let key of Object.getOwnPropertyNames(args)) {
        kvargs.push(`${key}=${FilterNode._handleArrayArguments(args[key])}`);
      }
    }
    const argsString = argterms.concat(kvargs).join(':');
    return(argsString.length > 0 ? '=' + argsString : '');
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
   * @returns {number} - a value from FilterNode.FilterIOTypes
   *
   * @private
   */
  static _getFilterIOType (ffmpegFilter) {
    if (ffmpegFilter && ffmpegFilter.source) {
      return FilterNode.FilterIOTypes.SOURCE;
    }
    if (ffmpegFilter && ffmpegFilter.sink) {
      return FilterNode.FilterIOTypes.SINK;
    }
    return FilterNode.FilterIOTypes.GENERIC;
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
    const out = execFileSync(ffmpeg_binary, ffmpeg_args, { stdio: 'pipe' });
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
   * Enumeration of filter I/O types
   *
   * @returns {Object} - the Filter I/O type constants as an object
   *
   * @private
   */
  static get FilterIOTypes () {
    return {
      /** Constant value representing a filter with both input(s) and output(s) */
      GENERIC: 0,
      /** Constant value representing a source filter with only output(s) */
      SOURCE: 1,
      /** Constant value representing a sink filter with only input(s) */
      SINK: 2,
    }
  }
}

/**
 * Enumeration of FFmpeg known filters completed?
 *
 * @private
 */
FilterNode._initialized = false;

module.exports = FilterNode;
