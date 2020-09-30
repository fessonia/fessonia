export = FFmpegOption;
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
    /**
     * Load the FilterGraph class and return it
     *
     * @returns {FilterGraph} - the FilterGraph class
     *
     * @private
     */
    private static _loadFilterGraph;
    /**
     * Create an option for an FFmpeg command
     * @param {string} name - the option name
     * @param {string|FilterNode|FilterChain|FilterGraph} arg - the argument for this option (default: null)
     */
    constructor(name: string, arg?: string | any | any | any);
    name: string;
    optionName: string;
    arg: any;
    /**
     * Generate the command array segment for this FFmpeg option
     * @returns {Array} the command array segment
     */
    toCommandArray(): any[];
    /**
     * Generate the command string segment for this FFmpeg option
     * @returns {string} the command string segment
     */
    toCommandString(): string;
    /**
     * Validate input for this FFmpeg Option
     * @param {string} name - the option name
     * @param {string} arg - the argument for this option
     *
     * @returns {Object} - validated values; throws error if invalid
     */
    validate(name: string, arg: string): any;
}
declare namespace FFmpegOption {
    export { FILTER_OPTIONS as FFmpegFilterOptions };
}
/**
 * List of option names that refer to filters
 *
 * @private
 */
declare const FILTER_OPTIONS: string[];
