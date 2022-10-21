/**
 * @fileOverview lib/filter_graph.ts - Defines and exports the FilterGraph class
 *
 * @private
 */

import type { iFilterNode } from './filter_node';
import type { iFilterChain } from './filter_chain';

export interface iFilterGraph {
  readonly chains: iFilterChain[];

  addFilterChain(chain: iFilterChain): void;
  chainPosition(chain: iFilterChain): number;
  toString(): string;

}

export interface FilterGraphConstructor {
  new(chains: Array<iFilterChain>): FilterGraph;
  wrap(filterChain: iFilterChain | iFilterNode): FilterGraph;
  wrap<T>(filterChain: T): T;
}

/** Class representing an FFmpeg filter graph
 */
export class FilterGraph implements iFilterGraph {
  /**
   * Create a filter graph for use in an FFmpeg command
   * @property {Array<FilterChain>} chains - filter nodes used in this graph
   */
  constructor (public readonly chains: Array<iFilterChain> = []) { }

  /**
   * Adds a filter chain to the filter graph
   * @param {FilterChain} chain - the filter chain to be added
   * @returns {void}
   * @throws {Error}
   */
  addFilterChain (chain: iFilterChain): void {
    import('./filter_chain').then(({ FilterChain }) => {
      if (!(chain instanceof FilterChain)) {
        throw new Error('Invalid parameter chain: must be instance of FilterChain');
      }
      this.chains.push(chain);
      chain.filterGraph = (this as FilterGraph as iFilterGraph);
    });
  }

  /**
   * Returns the position of the chain in the graph
   * @param {FilterChain} chain - the filter chain to look for
   * @returns {number} position of the chain in the graph
   */
  chainPosition (chain): number {
    return this.chains.findIndex((c) => c === chain);
  }

  /**
   * Returns a string representation of the filter graph
   * @returns {string} the filter graph's string representation
   */
  toString (): string {
    const s = this.chains
      .map((fc) => fc.toString())
      .join(';');
    return s;
  }

  /**
   * Wraps FilterChain objects in a FilterGraph
   * @param {FilterChain|FilterGraph|any} filterChain - the FilterChain to wrap
   * @returns {FilterGraph|any} the wrapped FilterChain, or the non-filter object unchanged
   * @static
   */
  static wrap<T>(filterObj: iFilterNode | iFilterChain | iFilterGraph | T): iFilterGraph | T {
    import('./filter_node').then(({ FilterNode }) => {
      import('./filter_chain').then(({ FilterChain }) => {
        if (filterObj instanceof FilterGraph) {
          return filterObj;
        } else if (filterObj instanceof FilterChain ||
          filterObj instanceof FilterNode) {
          const fg = new FilterGraph();
          fg.addFilterChain(FilterChain.wrap(filterObj));
          return fg;
        }
        return filterObj;
      });
    });
    throw new Error('Invalid Argument: filterObj must be a FilterNode, FilterChain, or FilterGraph object');
  }
}
