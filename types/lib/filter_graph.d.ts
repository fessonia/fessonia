import FilterChain from './filter_chain';
import FilterNode from './filter_node';

export default FilterGraph;

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
