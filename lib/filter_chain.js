/**
 * @fileOverview lib/filter_chain.js - Defines and exports the FilterChain class
 */

const { inspect } = require('util')

const FilterNode = require('./filter_node')

/**
 * Class representing an FFmpeg filter chain
 */
class FilterChain {
  /**
   * Create a FilterChain object
   * @param {Array<FilterNode>} nodes - the filters in the filter chain
   */
  constructor (nodes) {
    if (!Array.isArray(nodes) || nodes.length < 1) {
      throw new Error('Invalid parameter: nodes must have at least one FilterNode object');
    }
    this.nodes = nodes;
    this.inputs = [];
  }

  /**
   * Add inputs to the filter chain
   * @param {Array<FFmpegStreamSpecifier>} inputs - the input stream specifiers to connect to the chain
   * @returns {void}
   * @throws
   */
  addInputs (inputs) {
    this.inputs = this.inputs.concat(this.validateInputs(inputs));
  }

  /**
   * Add a single input to the chain
   * @param {FFmpegStreamSpecifier} input - the input stream specifier to connect to the chain
   * @returns {void}
   * @throws
   */
  addInput (input) {
    this.addInputs([input]);
  }

  /**
   * Get the input node of the chain
   * @returns {FilterNode} - the input node
   */
  get inputNode () {
    return this.nodes[0];
  }

  /**
   * Get the output node of the chain
   * @returns {FilterNode} - the output node
   */
  get outputNode () {
    return this.nodes[this.nodes.length - 1];
  }

  /**
   * Get the input pads of the chain
   * @returns {Array<string>} - the input pads
   */
  get inputPads () {
    return this.inputNode.inputs;
  }

  /**
   * Get the output pads of the chain
   * @returns {Array<string>} - the output pads
   */
  get outputPads () {
    return this.outputNode.outputs;
  }

  /**
   * Get an output stream specifier on this filter chain
   * @param {number|string|undefined} specifier - (optional) index/type of the output pad (default: next available pad)
   * @returns {FFmpegStreamSpecifier} - the stream specifier
   */
  streamSpecifier (specifier) {
    const FFmpegStreamSpecifier = FilterChain._loadFFmpegStreamSpecifier();
    return new FFmpegStreamSpecifier(this, specifier);
  }

  /**
   * Get an output pad label on this filter chain
   * @param {number|string|undefined} specifier - (optional) index/type of the output pad (default: next available pad)
   * @returns {string} - the output pad label
   */
  getOutputPad (specifier) {
    return this.outputNode.getOutputPad(specifier);
  }

  /**
   * Get an output pad index on this filter chain
   * @param {number|string|undefined} specifier - (optional) index/type of the output pad (default: next available pad)
   * @returns {index} - the output pad index
   */
  getOutputPadIndex (specifier) {
    return this.outputNode.getOutputPadIndex(specifier);
  }

  /**
   * Validate an array of inputs to the filter chain
   * @param {Array<FFmpegStreamSpecifier>} inputs - the input stream specifiers to validate
   * @returns {Array<FFmpegStreamSpecifier>} - the validated stream specifiers
   * @throws
   */
  validateInputs (inputs) {
    const FFmpegStreamSpecifier = FilterChain._loadFFmpegStreamSpecifier();
    if (!Array.isArray(inputs)) {
      throw new Error('Invalid argument: inputs must be an Array of FFmpegStreamSpecifier objects');
    }
    if (inputs.some((i) => (!i instanceof FFmpegStreamSpecifier))) {
      throw new Error('Invalid inputs specified: all inputs in Array must be FFmpegStreamSpecifier objects');
    }
    const inputsNeeded = this.inputPads.length;
    const orMore = this.inputPads.some((p) => p === 'N');
    const inputsProvided = this.inputs.length + inputs.length;
    if (!orMore && (inputsNeeded < inputsProvided)) {
      throw new Error(`Too many inputs specified: ${inputsNeeded} inputs required`);
    }
    if (inputsNeeded > inputsProvided) {
      logger.warn(`Not enough inputs on FilterChain ${this}: need ${inputsNeeded} and currently have ${inputsProvided}`);
    }
    return inputs;
  }

  /**
   * Generate a string representation of the filter chain
   * @returns {string} - the filter chain string
   */
  toString () {
    let inputs = this.inputs.map((i) => {
      const str = i.toString();
      if (str.startsWith('[') && str.endsWith(']')) {
        return str;
      }
      return `[${str}]`;
    }).join('');
    let filters = this.nodes.map((f) => f.toString()).join(',');
    let outputs = this.outputPads.map((_p, i) => `[${this.outputNode.padPrefix}_${i}]`).join('');
    return `${inputs}${filters}${outputs}`;
  }

  /**
   * Wraps the FilterNode object in a FilterChain
   * @param {FilterNode|FilterChain} filterNode - the FilterNode to wrap
   * @returns {FilterChain} the wrapped FilterNode, or the non-filter object unchanged
   * @static
   */
  static wrap (filterNode) {
    if (filterNode instanceof FilterNode) {
      return new FilterChain([filterNode]);
    }
    return filterNode;
  }

  /**
   * Load the FFmpegStreamSpecifier class and return it
   *
   * @returns {FFmpegStreamSpecifier} - the FFmpegStreamSpecifier class
   *
   * @private
   */
  static _loadFFmpegStreamSpecifier () {
    return require('./ffmpeg_stream_specifier');
  }
}

module.exports = FilterChain;
