/**
 * @fileOverview lib/filter_chain.ts - Defines and exports the FilterChain class
 */

import type { iFFmpegStreamSpecifier } from './ffmpeg_stream_specifier';
import type { iFilterNode } from './filter_node';
import type { iFilterGraph } from './filter_graph';

import { FilterNode } from './filter_node';

export interface iFilterChain {
  inputs: iFFmpegStreamSpecifier[];
  streamSpecifiers: iFFmpegStreamSpecifier[];
  filterGraph?: iFilterGraph;

  addInput(input: iFFmpegStreamSpecifier): void
  addInputs(inputs: iFFmpegStreamSpecifier[]): void;
  appendNodes(...nodes: iFilterNode[]): void;
  getOutputPad(specifier: string | number): string;
  position(): number;
  prependNodes (...nodes: iFilterNode[]): void;
  streamSpecifier(): iFFmpegStreamSpecifier;
  toString(): string;
}

export interface FilteChainConstructor {
  new(nodes: tArrayOfOneOrMore<iFilterNode>): FilterChain;
  wrap(filterChain: iFilterChain | iFilterNode): FilterChain;
  wrap<T>(filterChain: T): T;
}

/**
* Class representing an FFmpeg filter chain
*/
export class FilterChain implements iFilterChain {
  inputs: iFFmpegStreamSpecifier[];
  streamSpecifiers: iFFmpegStreamSpecifier[];
  filterGraph?: iFilterGraph;

  /**
  * Create a FilterChain object
  * @param {Array<FilterNode>} nodes - the filters in the filter chain
  */
  constructor (private nodes: tArrayOfOneOrMore<iFilterNode>) {
    if (!Array.isArray(nodes) || nodes.length < 1) {
      throw new Error('Invalid parameter: nodes Array cannot be empty; it must have at least one FilterNode object');
    }
    if (nodes.some((i) => (!(i instanceof FilterNode)))) {
      throw new Error('Invalid parameter: nodes Array must contain only FilterNode object');
    }
    this.inputs = [];
    this.streamSpecifiers = [];
  }

  /**
  * Append nodes to the FilterChain's nodes
  * @param {...FilterNode} nodes - the filter nodes in the filter chain
  * @returns {void}
  */
  appendNodes (...nodes: tArrayOfOneOrMore<iFilterNode>): void {
    this.nodes = [...this.nodes, ...nodes];
  }

  /**
  * Prepend nodes to the FilterChain's nodes
  * @param {...FilterNode} nodes - the filter nodes in the filter chain
  * @returns {void}
  */
  prependNodes (...nodes: tArrayOfOneOrMore<iFilterNode>): void {
    this.nodes = [...nodes, ...this.nodes];
  }

  /**
  * Add inputs to the filter chain
  * @param {Array<FFmpegStreamSpecifier>} inputs - the input stream specifiers to connect to the chain
  * @returns {void}
  * @throws {Error}
  */
  addInputs (inputs: tArrayOfOneOrMore<iFFmpegStreamSpecifier>): void {
    this.inputs = this.inputs.concat(this.validateInputs(inputs));
  }

  /**
  * Add a single input to the chain
  * @param {FFmpegStreamSpecifier} input - the input stream specifier to connect to the chain
  * @returns {void}
  * @throws {Error}
  */
  addInput (input: iFFmpegStreamSpecifier): void {
    this.addInputs([input]);
  }

  /**
  * Get the input node of the chain
  * @returns {FilterNode} - the input node
  */
  get inputNode (): iFilterNode {
    return this.nodes[0];
  }

  /**
  * Validate an array of inputs to the filter chain
  * @param {Array<FFmpegStreamSpecifier>} inputs - the input stream specifiers to validate
  * @returns {Array<FFmpegStreamSpecifier>} - the validated stream specifiers
  * @throws {Error}
  */
  async validateInputs (inputs: Array<iFFmpegStreamSpecifier>): Promise<Array<iFFmpegStreamSpecifier>> {
    if (!Array.isArray(inputs)) {
      throw new Error('Invalid argument: inputs must be an Array of FFmpegStreamSpecifier objects');
    }
    import('./ffmpeg_stream_specifier').then(({ FFmpegStreamSpecifier }) => {
      if (inputs.some((i) => (!(i instanceof FFmpegStreamSpecifier)))) {
        throw new Error('Invalid inputs specified: all inputs in Array must be FFmpegStreamSpecifier objects');
      }
    });
    return inputs;
  }

  /**
  * Get the output node of the chain
  * @returns {FilterNode} - the output node
  */
  get outputNode (): iFilterNode {
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
  * Get an output stream specifier on this filter chain
  * @param {number|string|undefined} specifier - (optional) index/type of the output pad (default: first pad)
  * @returns {FFmpegStreamSpecifier} - the stream specifier
  */
  streamSpecifier (): iFFmpegStreamSpecifier {
    import('./ffmpeg_stream_specifier').then(({ FFmpegStreamSpecifier }) => {
      const streamSpecifier = new FFmpegStreamSpecifier(
        this,
        this.streamSpecifiers.length
      );
      this.streamSpecifiers.push(streamSpecifier);

      return streamSpecifier;
    });
  }

  /**
  * Get an output pad label on this filter chain
  * @param {string} specifier - the index from the requesting FFmpegStreamSpecifier
  * @returns {string} - the output pad label
  */
  getOutputPad (specifier: string): string {
    return `chain${this.position()}_${this.outputNode.getOutputPad(specifier)}`;
  }

  /**
  * Get position of the filterChain in the filterGraph.
  * If not in a graph, returns 0
  * @returns {number} - the position of the chain in the graph
  */
  position (): number {
    if (!this.filterGraph) { return 0; }

    return this.filterGraph.chainPosition(this as FilterChain);
  }

  /**
  * Generate a string representation of the filter chain
  * @returns {string} - the filter chain string
  */
  toString (): string {
    let inputs = this.inputs.map((i) => {
      const str = i.toString();
      if (str.startsWith('[') && str.endsWith(']')) {
        return str;
      }
      return `[${str}]`;
    }).join('');
    let filters = this.nodes.map((f) => f.toString()).join(',');
    let outputs = this.streamSpecifiers.map(
      (specifier) => specifier.toString()
    ).join('');
    return `${inputs}${filters}${outputs}`;
  }

  /**
  * Wraps the FilterNode object in a FilterChain
  * @param {FilterNode|FilterChain} filterNode - the FilterNode to wrap
  * @returns {FilterChain} the wrapped FilterNode, or the non-filter object unchanged
  * @static
  */
  static wrap (filterObj: iFilterNode | iFilterChain): iFilterChain {
    if (filterObj instanceof FilterNode) {
      return new FilterChain([filterObj]);
    } else if (filterObj instanceof FilterChain) {
      return filterObj;
    }
  }
}

type tArrayOfOneOrMore<T> = [T, ...T[]];
