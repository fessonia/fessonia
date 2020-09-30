export = FilterChain;
/**
 * Class representing an FFmpeg filter chain
 */
declare class FilterChain {
    /**
     * Wraps the FilterNode object in a FilterChain
     * @param {FilterNode|FilterChain} filterNode - the FilterNode to wrap
     * @returns {FilterChain} the wrapped FilterNode, or the non-filter object unchanged
     * @static
     */
    static wrap(filterNode: import("./filter_node") | FilterChain): FilterChain;
    /**
     * Load the FFmpegStreamSpecifier class and return it
     *
     * @returns {FFmpegStreamSpecifier} - the FFmpegStreamSpecifier class
     *
     * @private
     */
    private static _loadFFmpegStreamSpecifier;
    /**
     * Create a FilterChain object
     * @param {Array<FilterNode>} nodes - the filters in the filter chain
     */
    constructor(nodes: Array<import("./filter_node")>);
    nodes: import("./filter_node")[];
    inputs: any[];
    streamSpecifiers: any[];
    /**
     * Append nodes to the FilterChain's nodes
     * @param {...FilterNode} nodes - the filter nodes in the filter chain
     * @returns {void}
     */
    appendNodes(...nodes: import("./filter_node")[]): void;
    /**
     * Prepend nodes to the FilterChain's nodes
     * @param {...FilterNode} nodes - the filter nodes in the filter chain
     * @returns {void}
     */
    prependNodes(...nodes: import("./filter_node")[]): void;
    /**
     * Add inputs to the filter chain
     * @param {Array<FFmpegStreamSpecifier>} inputs - the input stream specifiers to connect to the chain
     * @returns {void}
     * @throws {Error}
     */
    addInputs(inputs: Array<any>): void;
    /**
     * Add a single input to the chain
     * @param {FFmpegStreamSpecifier} input - the input stream specifier to connect to the chain
     * @returns {void}
     * @throws {Error}
     */
    addInput(input: any): void;
    /**
     * Get the input node of the chain
     * @returns {FilterNode} - the input node
     */
    get inputNode(): import("./filter_node");
    /**
     * Validate an array of inputs to the filter chain
     * @param {Array<FFmpegStreamSpecifier>} inputs - the input stream specifiers to validate
     * @returns {Array<FFmpegStreamSpecifier>} - the validated stream specifiers
     * @throws {Error}
     */
    validateInputs(inputs: Array<any>): Array<any>;
    /**
     * Get the output node of the chain
     * @returns {FilterNode} - the output node
     */
    get outputNode(): import("./filter_node");
    /**
     * Get the input pads of the chain
     * @returns {Array<string>} - the input pads
     */
    get inputPads(): string[];
    /**
     * Get an output stream specifier on this filter chain
     * @param {number|string|undefined} specifier - (optional) index/type of the output pad (default: first pad)
     * @returns {FFmpegStreamSpecifier} - the stream specifier
     */
    streamSpecifier(): any;
    /**
     * Get an output pad label on this filter chain
     * @param {string} specifier - the index from the requesting FFmpegStreamSpecifier
     * @returns {string} - the output pad label
     */
    getOutputPad(specifier: string): string;
    /**
     * Get position of the filterChain in the filterGraph.
     * If not in a graph, returns 0
     * @returns {number} - the position of the chain in the graph
     */
    position(): number;
    /**
     * Generate a string representation of the filter chain
     * @returns {string} - the filter chain string
     */
    toString(): string;
}
