export = FFmpegCommand;
/**
 * Class representing an FFmpeg command (`ffmpeg ...`)
 *
 * @extends events.EventEmitter
 */
declare class FFmpegCommand {
    /**
     * Validate the options passed into the constructor
     * @param {Object} options - the options for the input
     * @returns {Map} - validated options
     */
    static validateOptions(options: any): any;
    /**
     * Load the FFmpegProgressEmitter class and return it
     *
     * @returns {FFmpegProgressEmitter} the FFmpegProgressEmitter class
     *
     * @private
     */
    private static _loadFFmpegProgressEmitter;
    /**
     * Load the FilterGraph class and return it
     *
     * @returns {FilterGraph} the FilterGraph class
     *
     * @private
     */
    private static _loadFilterGraph;
    /**
     * Create an FFmpegCommand object
     * @param {Object} options - the global options for the command
     *
     * @property {Map<string,Object>} options - global options for the command
     * @property {Array<FFmpegInput>} _inputs - input files (with their options) for the command
     * @property {Array<FFmpegOutput>} _outputs - output files (with their options) for the command
     * @property {Array<FilterGraph>|undefined} _filterGraph - the command's filter graph
     *
     * @emits FFmpegCommand#update
     */
    constructor(options?: any);
    options: any;
    _inputs: any[];
    _outputs: any[];
    _filterGraph: any;
    _progressEmitter: any;
    /**
     * Add an input to the FFmpegCommand object
     * @param {FFmpegInput} input - ffmpeg input object
     * @returns {void}
     */
    addInput(input: import("./ffmpeg_input")): void;
    /**
     * Add an output to the FFmpegCommand object
     * @param {FFmpegOutput} output - ffmpeg output object
     * @returns {void}
     */
    addOutput(output: import("./ffmpeg_output")): void;
    /**
     * Add a filter chain to the FFmpegCommand object's filter graph
     * @param {FilterGraph} filterChain - filter chain object
     * @returns {void}
     */
    addFilterChain(filterChain: any): void;
    /**
     * Get inputs on the FFmpegCommand object
     *
     * @returns {Array<FFmpegInput>} the inputs
     */
    inputs(): Array<import("./ffmpeg_input")>;
    /**
     * Get outputs on the FFmpegCommand object
     *
     * @returns {Array<FFmpegOutput>} the outputs
     */
    outputs(): Array<import("./ffmpeg_output")>;
    /**
     * Get the filter graph on the FFmpegCommand object
     *
     * @returns {FilterGraph} the filter graphs
     */
    get filterGraph(): any;
    /**
     * Get most recent log lines from the ffmpeg run
     * @param {number} n - the number of lines to pull (default: 1)
     * @returns {Array<string>} - the log lines
     */
    logLines(n?: number): Array<string>;
    /**
     * Get the currently buffered log data from the ffmpeg run
     * @returns {Array<string>} - the log data
     */
    logData(): Array<string>;
    /**
     * Generate the command representation of the command
     *
     * @returns {Object} - an object containing keys 'command' and 'args'
     */
    toCommand(): any;
    /**
     * Generate the string representation of the command
     *
     * @returns {string} - the command string to be executed
     */
    toString(): string;
    /**
     * Execute the command and return a promise for the output
     *
     * @returns {Promise} - the child_process promise handling the execution
     *
     * @throws {FFmpegError}
     */
    execute(): Promise<any>;
    /**
     * Spawn a child process to execute the command and return the child process
     * @param {boolean} emitEvents - emit events about process state and progress (default: true)
     *
     * @returns {ChildProcess} - the child_process
     */
    spawn(emitEvents?: boolean): any;
    /**
     * Attach handlers for child process events
     *
     * @param {ChildProcess} proc - the child process to listen on
     *
     * @emits FFmpegCommand#success
     * @emits FFmpegCommand#failure
     * @emits FFmpegCommand#error
     *
     * @returns {void}
     *
     * @private
     */
    private _handleProcessEvents;
}
