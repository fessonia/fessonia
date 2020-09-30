export = FilterGraph;
/**
 * @fileOverview lib/filter_graph.js - Defines and exports the FilterGraph class
 *
 * @private
 */
/** Class representing an FFmpeg filter graph
 */
declare class FilterGraph {
    /**
     * Wraps FilterChain objects in a FilterGraph
     * @param {FilterChain|FilterGraph|any} filterChain - the FilterChain to wrap
     * @returns {FilterGraph|any} the wrapped FilterChain, or the non-filter object unchanged
     * @static
     */
    static wrap(filterChain: any | FilterGraph | any): FilterGraph | any;
    /**
     * Load the FilterNode class and return it
     *
     * @returns {FilterNode} - the FilterNode class
     *
     * @private
     */
    private static _loadFilterNode;
    /**
     * Load the FilterChain class and return it
     *
     * @returns {FilterChain} - the FilterChain class
     *
     * @private
     */
    private static _loadFilterChain;
    chains: any[];
    /**
     * Adds a filter chain to the filter graph
     * @param {FilterChain} chain - the filter chain to be added
     * @returns {void}
     * @throws {Error}
     */
    addFilterChain(chain: any): void;
    /**
     * Returns the position of the chain in the graph
     * @param {FilterChain} chain - the filter chain to look for
     * @returns {number} position of the chain in the graph
     */
    chainPosition(chain: any): number;
    /**
     * Returns a string representation of the filter graph
     * @returns {string} the filter graph's string representation
     */
    toString(): string;
}
