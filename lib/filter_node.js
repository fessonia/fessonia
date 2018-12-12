/**
 * FFmpeg Filter Node module.
 * @module filter_node
 */

const config = new require('./util/config')(),
  logger = config.logger,
  FFmpegEnumerations = require('./ffmpeg_enumerations');

/** Class representing a single node in an FFmpeg filter chain */
class FilterNode {
  /**
   * Create a filter for use in an FFmpeg filter chain
   * @param {string} alias - an identifier for this node
   * @param {Object} options - the options for the filter 
   */
  constructor (alias, options) {
    this.alias = alias;

    this.ffmpegFilterInfo = undefined;
    this.filterIOType = undefined;
    this.inputType = undefined;
    this.outputType = undefined;
    this.timelineSupport = undefined;
    this.sliceThreading = undefined;
    this.commandSupport = undefined;

    if (!FilterNode._initialized) { FilterNode.initialize(); }
    this._configureFilter(options);

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

  // Helper functions

  /**
   * Validate the options object used to create a filter node
   * @param {Object} options - the options for the input
   * 
   * @returns {Object} - returns options passed in if no error
   */
  _validateOptions (options) {
    if (!options.hasOwnProperty('filterName')) {
      logger.error(`FilterNode ${this.alias} options object does not specify a 'filterName' property. Please supply a value for options.filterName when creating the FilterNode.`);
      throw new Error(`FilterNode ${this.alias} options object does not specify a 'filterName' property. Please supply a value for options.filterName when creating the FilterNode.`);
    }
    const info = FilterNode.ValidFilters[options.filterName];
    if (!info) {
      logger.warn(`FilterNode ${this.alias} options object specifies unknown value for 'filterName' property. Please ensure that your FFmpeg installation understands the filter name. You can see what filters FFmpeg knows about with: ffmpeg -filters`);
    }
    if (info) {
      let pads;
      switch (info.inputPads) {
      case undefined:
      case null:
        break;
      case '|':
        this.inputType = info.inputPads;
        this.inputs = null;
        this.inputsCount = 0;
        break;
      case 'N':
        this.inputType = info.inputPads;
        this.inputs = [];
        this.inputsCount = null;
        break;
      default:
        pads = info.inputPads.split('');
        this.inputType = info.inputPads;
        this.inputs = pads;
        this.inputsCount = pads.length;
      }
      switch (info.outputPads) {
      case undefined:
      case null:
        break;
      case '|':
        this.outputType = info.outputPads;
        this.outputs = null;
        this.outputsCount = 0;
        break;
      case 'N':
        this.outputType = info.outputPads;
        this.outputs = [];
        this.outputsCount = null;
        break;
      default:
        pads = info.inputPads.split('');
        this.outputType = info.outputPads;
        this.outputs = pads;
        this.outputsCount = pads.length;
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
          throw new Error(`Invalid argument ${arg.toString()} of FilterNode ${this.alias}. Filter arguments should be either a string or an object with keys 'name' and 'value', or in rare cases, an Array.`);
        }
        break;
      case 'string':
      case 'number':
        argterms.push(arg);
        break;
      default:
        throw new Error(`Invalid argument ${arg.toString()} of FilterNode ${this.alias}. Filter arguments should be either a string or an object with keys 'name' and 'value', or in rare cases, an Array.`);
      }
    }
    return('=' + (argterms.concat(kvargs).join(':')));
  }

  /**
   * Process Array-valued arguments to a filter
   * @param {Object} arg - the Array-valued argument data
   * 
   * @returns {string} - a the arguments sub-string for the Array-valued argument value
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
   */
  static _getFilterIOType (ffmpegFilter) {
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
}

/** Enumeration of FFmpeg known filters completed? */
FilterNode._initialized = false;

module.exports = FilterNode;




// hasInputs = this.filterIOType === FFmpegEnumerations.FilterIOTypes.GENERIC ||
//   this.filterIOType === FFmpegEnumerations.FilterIOTypes.SINK,
// hasOutputs = this.filterIOType === FFmpegEnumerations.FilterIOTypes.GENERIC ||
//   this.filterIOType === FFmpegEnumerations.FilterIOTypes.SOURCE;
// if (hasInputs) {
//   for (let input of this.options.inputs) { cmd.push(`[${input.alias}]`); }
// }
// if (hasOutputs) {
//   for (let output of this.options.outputs) { cmd.push(`[${output.alias}]`); }
// }




// possibly could have:
//   FilterNode -> FilterNode
//   [FilterNode, ...] -> FilterNode
//   FilterNode -> [FilterNode, ...]
//   [FilterNode, ...] -> [FilterNode, ...]
// move this to FilterChain
// FilterNode.connectNodes = function (filterNode1, filterNode2) {
//   if (filterNode1 instanceof FilterNode) {
//     if (filterNode2 instanceof FilterNode) {
//       connectNodesOneToOne(filterNode1, filterNode2);
//     } else if (filterNode2 instanceof Array) {
//       connectNodesOneToMany(filterNode1, filterNode2);
//     } else {
//       throw new Error('Invalid arguments to FilterNode.connectNodes: must be either FilterNode objects or Arrays of FilterNode objects.');
//     }
//   } else if (filterNode1 instanceof Array) {
//     if (filterNode2 instanceof FilterNode) {
//       connectNodesManyToOne(filterNode1, filterNode2);
//     } else if (filterNode2 instanceof Array) {
//       throw new Error('Invalid arguments: cannot support connecting nodes many-to-many. At least one argument must be a single FilterNode object.');
//     }
//   } else {
//     throw new Error('Invalid arguments: must be at least one FilterNode object, and either another FilterNode object or an Array of FilterNode objects.');
//   }
// };

/*
const connectNodesOneToOne = function (filterNode1, filterNode2) {
  if (!(filterNode1 instanceof FilterNode) && !(filterNode2 instanceof FilterNode)) {
    throw new Error('Invalid arguments: must be FilterNode objects.');
  }
  if (filterNode2._prev !== filterNode1) filterNode2._prev = filterNode1;
  if (filterNode1._next !== filterNode2) filterNode1._next = filterNode2;
};

const connectNodesOneToMany = function (filterNode, filterNodes) {
  if (!(filterNode instanceof FilterNode) || !(filterNodes instanceof Array) ||
    filterNodes.every((n) => (n instanceof FilterNode))) {
    throw new Error('Invalid arguments: must be FilterNode object, Array of FilterNode objects.');
  }
  filterNodes.forEach((node) => {
    if (node._prev !== filterNode) { node._prev = filterNode; }
  });
  if (filterNode._next !== filterNodes) filterNode._next = filterNodes;
};

const connectNodesManyToOne = function (filterNodes, filterNode) {
  if (!(filterNode instanceof FilterNode) || !(filterNodes instanceof Array) ||
    filterNodes.every((n) => (n instanceof FilterNode))) {
    throw new Error('Invalid arguments: must be Array of FilterNode objects, FilterNode object.');
  }
  if (filterNode._prev !== filterNodes) filterNode._prev = filterNodes;
  filterNodes.forEach((node) => {
    if (node._next !== filterNode) { node._next = filterNode; }
  });
};
*/
