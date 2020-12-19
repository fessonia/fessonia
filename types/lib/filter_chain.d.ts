import FilterNode from './filter_node'
import FFmpegStreamSpecifier from './ffmpeg_stream_specifier';

export default FilterChain;

/** Class representing an FFmpeg filter chain */
declare class FilterChain {
    inputNode: FilterNode;
    inputPads: string[];
    nodes: FilterNode[];
    outputNode: FilterNode;
    inputs: FFmpegStreamSpecifier[];
    streamSpecifiers: FFmpegStreamSpecifier[];

    constructor(nodes: FilterNode[]);

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
