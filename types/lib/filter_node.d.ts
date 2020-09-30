export = FilterNode;
/** Class representing a single node in an FFmpeg filter graph */
declare class FilterNode {
    /**
     * Process Array-valued arguments to a filter
     * @param {Object} arg - the Array-valued argument data
     *
     * @returns {string} - a the arguments sub-string for the Array-valued argument value
     *
     * @private
     */
    private static _handleArrayArguments;
    /**
     * Create a filter for use in an FFmpeg filter graph
     * @param {string} filterName - the name of the filter
     * @param {Array<any>} args - the arguments for the filter (default: {})
     */
    constructor(filterName: string, args?: Array<any>);
    filterName: string;
    args: any[];
    /**
     * Generate the argument string defining this FFmpeg filter node
     * @returns {string} the filter argument string
     */
    toString(): string;
    /**
     * Get the output pad label based on the specifier
     * @param {number|string} specifier the output pad specifier
     * @returns {string} - the output pad label
     */
    getOutputPad(specifier: number | string): string;
    /**
     * Validate the options object used to create a filter node
     * @param {string} filterName - the filterName for the filter
     * @param {Object} args - the arguments for the filter
     * @param {Object} options - the options for the FilterNode object
     *
     * @returns {Object} - returns object with all arguments passed in if no error
     *
     * @private
     */
    private _validateOptions;
    /**
     * Generate the FFmpeg-formatted arguments for the filter node
     *
     * @returns {string} - the FFmpeg-formatted arguments string
     *
     * @private
     */
    private _processFilterArguments;
}
