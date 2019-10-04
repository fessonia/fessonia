/**
 * @fileOverview lib/filter_graph.js - Defines and exports the FilterGraph class
 * 
 * @private
 */

/** Class representing an FFmpeg filter graph
 */
class FilterGraph {
  /**
   * Create a filter graph for use in an FFmpeg command
   * @property {Array<FilterChain>} chains - filter nodes used in this graph
   */
  constructor () {
    this.chains = [];
  }

  /**
   * Adds a filter chain to the filter graph
   * @param {FilterChain} chain - the filter chain to be added
   * @returns {void}
   * @throws {Error}
   */
  addFilterChain (chain) {
    const FilterChain = FilterGraph._loadFilterChain()
    if (!(chain instanceof FilterChain)) {
      throw new Error('Invalid parameter chain: must be instance of FilterChain');
    }
    this.chains.push(chain);
  }

  /**
   * Returns a string representation of the filter graph
   * @returns {string} the filter graph's string representation
   */
  toString () {
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
  static wrap (filterChain) {
    const FilterNode = FilterGraph._loadFilterNode();
    const FilterChain = FilterGraph._loadFilterChain();
    if (filterChain instanceof FilterGraph) {
      return filterChain;
    } else if (filterChain instanceof FilterChain ||
      filterChain instanceof FilterNode) {
      const fg = new FilterGraph();
      fg.addFilterChain(FilterChain.wrap(filterChain));
      return fg;
    }
    return filterChain;
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
   * Load the FilterChain class and return it
   *
   * @returns {FilterChain} - the FilterChain class
   *
   * @private
   */
  static _loadFilterChain () {
    return require('./filter_chain');
  }
}

module.exports = FilterGraph;
