import FFmpegOption from './ffmpeg_option';
import FilterChain from './filter_chain';
import FilterGraph from './filter_graph';
import FilterNode from './filter_node';
import FFmpegStreamSpecifier from './ffmpeg_stream_specifier';

export default FFmpegInput;

/** Class representing an FFmpeg input file (`-i`) */
declare class FFmpegInput {
    filterObject?: FilterGraph;
    filterType?: 'FilterGraph';
    inputLabel: string | undefined;
    options: FFmpegOption[];
    url: string;

    /**
     * @param url the address of the input file, or a filter object to use as input
     */
    constructor(url: FFmpegInput.UrlParam, options?: FFmpegInput.Options);

    /**
     * Get a stream specifier for a stream on this input
     *
     * @param specifier the stream specifier (stream index, 'v', 'a', 's', 'd', or 't')
     */
    streamSpecifier(specifier: string | number): FFmpegStreamSpecifier;
}

declare namespace FFmpegInput {
    export type Options = Map<string, FFmpegOption.OptionValue> | { [key: string]: FFmpegOption.OptionValue };
    export type UrlParam = string | FilterNode | FilterChain | FilterGraph;
}
