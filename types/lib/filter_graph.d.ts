import FilterChain = require('./filter_chain');
import FilterNode = require('./filter_node');

export = FilterGraph;

/** Class representing an FFmpeg filter graph */
declare class FilterGraph {
    chains: FilterChain[];

    constructor();

    addFilterChain(chain: FilterChain): void;
    chainPosition(chain: FilterChain): number;
    toString(): string;
    static wrap(filterChain: FilterChain | FilterNode): FilterGraph;
    static wrap<T>(filterChain: T): T;
}
