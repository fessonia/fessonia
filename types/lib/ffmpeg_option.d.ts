import FilterChain from './filter_chain';
import FilterGraph from './filter_graph';
import FilterNode from './filter_node';

export default FFmpegOption;

/**
 * Class representing an FFmpeg option
 *
 * NOTE: This class is for internal use, intended for validation and
 * serialization of options added to an FFmpeg command. It is not
 * intended for use as a library interface to other code.
 *
 * @private
 */
declare class FFmpegOption {
    arg: FFmpegOption.OptionValue | null;
    name: string;
    optionName: string;

    /**
     * Create an option for an FFmpeg command
     * @param name the option name
     * @param arg - the argument for this option (default: null)
     */
    constructor(name: string, arg?: FFmpegOption.OptionValue | null);
}

declare namespace FFmpegOption {
    export const FILTER_OPTIONS: ['filter', 'filter:v', 'vf', 'filter:a', 'af', 'filter_complex', 'lavfi'];
    export type OptionValue = string | FilterNode | FilterChain | FilterGraph;
}
