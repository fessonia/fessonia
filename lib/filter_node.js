/**
 * FFmpeg Filter Node module.
 * @module filter_node
 */

const config = new require('./util/config')(),
  logger = config.logger;

/** Class representing a single node in an FFmpeg filter chain */
class FilterNode {
  /**
   * Create a filter for use in an FFmpeg filter chain
   * @param {string} alias - an identifier for this node
   * @param {Object} options - the options for the input 
   */
  constructor (alias, options) {
    this.alias = alias;

    this.ffmpegFilterInfo = undefined;
    this.filterCommand = undefined;
    this.filterIOType = undefined;
    this.inputType = undefined;
    this.outputType = undefined;
    this.timelineSupport = undefined;
    this.sliceThreading = undefined;
    this.commandSupport = undefined;

    this._configureFilter(options);

    return this;
  }

  /**
   * Generate the command array segment for this FFmpeg filter
   * @return {Array} the command array segment
   */
  toCommandArray () {
    const cmd = [],
      hasInputs = this.filterIOType === FilterNode.FilterIOTypes.GENERIC ||
        this.filterIOType === FilterNode.FilterIOTypes.SINK,
      hasOutputs = this.filterIOType === FilterNode.FilterIOTypes.GENERIC ||
        this.filterIOType === FilterNode.FilterIOTypes.SOURCE;
    if (hasInputs) {
      for (let input of this.options.inputs) { cmd.push(`[${input.alias}]`); }
    }
    let filterString = this.options.filterName +
      (this.options.id ? `@${this.options.id}` : '') +
      this._processFilterArguments(this.options.args);
    cmd.push(filterString);
    if (hasOutputs) {
      for (let output of this.options.outputs) { cmd.push(`[${output.alias}]`); }
    }
    return (cmd);
  }
  
  /**
   * Generate the command string segment for this FFmpeg filter
   * @return {string} the command string segment
   */
  toCommandString () {
    return (this.toCommandArray().join(' '));
  }

  /**
   * Generate a debug-friendly string representation of this filter
   * @return {string} the string representation
   */
  toString () {
    const description = // `${this._prev ? '' : '"' + this._prev.alias + '" -> '}` +
      `"${this.toCommandString()}"`; // + `${this._next ? '' : ' -> "' + this._next.alias + '"'}`;
    return `FilterNode("${this.alias}", ${description})`;
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
      const hasInputs = options.inputs && options.inputs.length > 0;
      const hasOutputs = options.outputs && options.outputs.length > 0;
  
      if (info.sink && hasOutputs) {
        throw new Error(`InvalidOptions: FilterNode ${this.alias} options object specifies outputs for filter ${options.filterName} which is a SINK-type filter (${info.inputPads}->${info.outputPads}).`);
      }
      if ((info.sink || !(info.sink || info.source)) && !hasInputs) {
        throw new Error(`InvalidOptions: FilterNode ${this.alias} options object does not specify inputs for filter ${options.filterName} which requires inputs (${info.inputPads}->${info.outputPads}).`);
      }
      if (info.source && hasInputs) {
        throw new Error(`InvalidOptions: FilterNode ${this.alias} options object specifies inputs for filter ${options.filterName} which is a SOURCE-type filter (${info.inputPads}->${info.outputPads}).`);
      }
      if ((info.source || !(info.sink || info.source)) && !hasOutputs) {
        throw new Error(`InvalidOptions: FilterNode ${this.alias} options object does not specify outputs for filter ${options.filterName} which requires outputs (${info.inputPads}->${info.outputPads}).`);
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
    this.filterCommand = FilterNode._getFilterCommand(ffmpegFilter);
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
   * Set the FFmpeg CLI option to use with the filter node
   * @param {Object} ffmpegFilter - filter info pulled from FFmpeg
   * 
   * @returns {string} - a value from FilterNode.FilterCommands
   */
  static _getFilterCommand (ffmpegFilter) {
    // check inputs and outputs
    const isComplex = ['inputPads', 'outputPads']
      .some(function (k) {
        if (!ffmpegFilter || !ffmpegFilter.hasOwnProperty(k)) {
          logger.warn(`Warning: Unknown filter or FilterNode has no property '${k}', assuming complex filter`);
          return true;
        }
        return ffmpegFilter[k].length > 1 || ffmpegFilter[k] === 'N';
      });
    // set filter I/O type
    if (isComplex) { return FilterNode.FilterCommands.COMPLEX; }
    return FilterNode.FilterCommands.FILTER;
  }

  /**
   * Set the FFmpeg filter I/O type (source, sink or generic)
   * @param {Object} ffmpegFilter - filter info pulled from FFmpeg
   * 
   * @returns {string} - a value from FilterNode.FilterIOTypes
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
   */
  static _getValidFiltersFromFFmpeg () {
    const childProcess = require('child_process'),
      execFileSync = childProcess.execFileSync;
    const filters = {};
    const ffmpeg_binary = config.ffmpeg_bin;
    if (!ffmpeg_binary) throw new Error(`No ffmpeg binary found in config: '${ffmpeg_binary}'`);
    const out = execFileSync(config.ffmpeg_bin, ['-filters', '2>/dev/null'], {});
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

/** Enumeration of filter commands */
FilterNode.FilterCommands = {};
/** Constant value for the '-filter' command option */
FilterNode.FilterCommands.FILTER = '-filter';
/** Constant value for the '-filter_complex' command option */
FilterNode.FilterCommands.COMPLEX = '-filter_complex';

/** Enumeration of filter I/O types */
FilterNode.FilterIOTypes = {};
/** Constant value representing a filter with both input(s) and output(s) */
FilterNode.FilterIOTypes.GENERIC = 0;
/** Constant value representing a source filter with only output(s) */
FilterNode.FilterIOTypes.SOURCE  = 1;
/** Constant value representing a sink filter with only input(s) */
FilterNode.FilterIOTypes.SINK    = 2;

/** Enumeration of filter media types */
FilterNode.FilterMediaTypes = {};
/** Constant value representing non-stream-specified media type */
FilterNode.FilterMediaTypes.GENERIC = '';
/** Constant value representing an audio stream specifier */
FilterNode.FilterMediaTypes.AUDIO   = ':a';
/** Constant value representing a video stream specifier */
FilterNode.FilterMediaTypes.VIDEO   = ':v';

/** Enumeration of FFmpeg known filters */
FilterNode.ValidFilters = FilterNode._getValidFiltersFromFFmpeg();


module.exports = FilterNode;



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
