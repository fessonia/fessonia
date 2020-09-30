export = FFmpegOutput;
/** Class representing an FFmpeg output file */
declare class FFmpegOutput {
    /**
     * Validate the options passed into the constructor
     * @param {Object} options - the options for the output
     * @returns {Array<FFmpegOption>} array of validated FFmpegOption objects
     */
    static validateOptions(options: any): Array<any>;
    /**
     * Load the FFmpegStreamSpecifier class and return it
     *
     * @returns {FFmpegStreamSpecifier} - the FFmpegStreamSpecifier class
     *
     * @private
     */
    private static _loadFFmpegStreamSpecifier;
    /**
     * Load the FFmpegOption class and return it
     *
     * @returns {FFmpegOption} - the FFmpegOption class
     *
     * @private
     */
    private static _loadFFmpegOption;
    /**
     * Create an output for an FFmpeg command
     * @param {string} url - the location of the output file
     * @param {Object} options - the options for the output
     * @property {Array<StreamSpecifier>} streams - specifiers for the media streams mapped into this output
     */
    constructor(url: string, options?: any);
    url: string;
    options: any[];
    streams: any[];
    /**
     * Generate the command array segment for this FFmpeg output
     * @returns {Array} the command array segment
     */
    toCommandArray(): any[];
    /**
     * Generate the command string segment for this FFmpeg output
     * @returns {string} the command string segment
     */
    toCommandString(): string;
    /**
     * Generate a developer-friendly string representing for this FFmpeg output
     * @returns {string} the string representation
     */
    toString(): string;
    /**
     * Add media streams to the output
     * @param {Array<FFmpegStreamSpecifier>} streamSpecifiers - specifiers for the streams to map into this output (in order)
     * @returns {void}
     * @throws {Error}
     */
    addStreams(streamSpecifiers: Array<any>): void;
    /**
     * Add a single media stream to the output
     * @param {FFmpegStreamSpecifier} streamSpecifier - specifier for the stream map into this output
     * @returns {void}
     * @throws {Error}
     */
    addStream(streamSpecifier: any): void;
    /**
     * Validate an array of inputs to the filter chain
     * @param {Array<FFmpegStreamSpecifier>} streamSpecifiers - specifiers for the streams to validate
     * @returns {Array<FFmpegStreamSpecifier>} - the validated stream specifiers
     * @throws {Error}
     */
    validateStreams(streamSpecifiers: Array<any>): Array<any>;
    /**
     *
     * @param {Object} options - the options to be added to the output
     * @returns {void}
     */
    addOptions(options: any): void;
}
