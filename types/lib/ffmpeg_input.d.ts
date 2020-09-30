export = FFmpegInput;
/**
 * Class representing an FFmpeg input file (`-i`)
 */
declare class FFmpegInput {
    /**
     * Validate the url passed into the constructor
     * @param {string|FilterNode|FilterChain|FilterGraph} url - the url for the input
     * @returns {Object} results of the validation; errors if invalid
     */
    static validateUrl(url: string | any | any | any): any;
    /**
     * Validate the options passed into the constructor
     * @param {Object} options - the options for the input
     * @returns {Array<FFmpegOption>} array of validated FFmpegOption objects; errors if invalid
     */
    static validateOptions(options: any): Array<any>;
    /**
     * Load the FilterGraph class and return it
     *
     * @returns {FilterGraph} - the FilterGraph class
     *
     * @private
     */
    private static _loadFilterGraph;
    /**
     * Load the FFmpegOption class and return it
     *
     * @returns {FFmpegOption} - the FFmpegOption class
     *
     * @private
     */
    private static _loadFFmpegOption;
    /**
     * Load the FFmpegStreamSpecifier class and return it
     *
     * @returns {FFmpegStreamSpecifier} - the FFmpegStreamSpecifier class
     *
     * @private
     */
    private static _loadFFmpegStreamSpecifier;
    /**
     * Create an input for an FFmpeg command
     * @param {string|FilterNode|FilterChain|FilterGraph} url - the address of the input file, or a filter object to use as input
     * @param {Object} options - the options for the input
     *
     * @property {Object} url - the url for the input, post-validation
     * @property {Object} options - the options for the input, post-validation
     */
    constructor(url: string | any | any | any, options?: any);
    options: any[];
    _inputLabel: string;
    /**
     * Set the label for this input object.
     * @param {string} newLabel - the new value for the label for this input object.
     */
    set inputLabel(arg: string);
    /**
     * Return the label for this input object.
     * @returns {string} - the label defined on this object.
     */
    get inputLabel(): string;
    /**
     * Get a stream specifier for a stream on this input
     * @param {string|number} specifier - the stream specifier (stream index, 'v', 'a', 's', 'd', or 't')
     * @returns {FFmpegStreamSpecifier} - the stream specifier object
     */
    streamSpecifier(specifier: string | number): any;
    /**
     * Generate the command array segment for this FFmpeg input
     * @returns {Array} the command array segment
     */
    toCommandArray(): any[];
    /**
     * Generate the command string segment for this FFmpeg input
     * @returns {string} the command string segment
     */
    toCommandString(): string;
    /**
     * Generate a developer-friendly string representing for this FFmpeg input
     * @returns {string} the string representation
     */
    toString(): string;
}
