import FilterNode = require('./filter_node');
import FFmpegStreamSpecifier = require('./ffmpeg_stream_specifier');

export = FilterChain;

type ArrayOfOneOrMore<T> = [T, ...T[]];

/** Class representing an FFmpeg filter chain */
declare class FilterChain {
    inputNode: FilterNode;
    inputPads: string[];
    nodes: FilterNode[];
    outputNode: FilterNode;
    inputs: FFmpegStreamSpecifier[];
    streamSpecifiers: FFmpegStreamSpecifier[];

    constructor(nodes: ArrayOfOneOrMore<FilterNode>);

    addInput(input: FFmpegStreamSpecifier): void
    addInputs(inputs: FFmpegStreamSpecifier[]): void;
    appendNodes(...nodes: FilterNode[]): void;
    getOutputPad(specifier: string | number): string;
    position(): number;
    prependNodes (...nodes: FilterChain[]): void;
    streamSpecifier(): FFmpegStreamSpecifier;
    toString(): string;
    static wrap(filterNode: FilterNode | FilterChain): FilterChain;
}
