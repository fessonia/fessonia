/**
 * @fileOverview lib/ffmpeg_command.js - Defines and exports the FFmpegCommand class
 */

const { EventEmitter } = require('events');

const config = require('./util/config')(),
  cp = require('child_process'),
  FFmpegInput = require('./ffmpeg_input'),
  FFmpegOutput = require('./ffmpeg_output'),
  FFmpegError = require('./ffmpeg_error'),
  Chunker = require('./util/chunker'),
  { createCommandString } = require('./util/command_string_creator');

/**
 * Class representing an FFmpeg command (`ffmpeg ...`)
 *
 * @extends events.EventEmitter
 */
class FFmpegCommand extends EventEmitter {
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
  constructor (options = new Map()) {
    super();
    this.options = FFmpegCommand.validateOptions(options);
    this._inputs = [];
    this._outputs = [];
    this._filterGraph = undefined;
    const FFmpegProgressEmitter = FFmpegCommand._loadFFmpegProgressEmitter();
    this._progressEmitter = new FFmpegProgressEmitter();
    /**
     * @event FFmpegCommand#update
     * @description Event with an update on FFmpeg progress on the command. Progress lines from FFmpeg are parsed by an {@link FFmpegProgressEmitter} object to generate the data for this event.
     * @type {Object}
     * @property {any} * - all properties included in the FFmpegProgressEmitter's `progressData` object
     */
    this._progressEmitter.on('update', (data) => this.emit('update', data));
  }

  /**
   * Add an input to the FFmpegCommand object
   * @param {FFmpegInput} input - ffmpeg input object
   * @returns {void}
   */
  addInput (input) {
    input.inputLabel = this._inputs.length;
    this._inputs.push(input);
  }

  /**
   * Add an output to the FFmpegCommand object
   * @param {FFmpegOutput} output - ffmpeg output object
   * @returns {void}
   */
  addOutput (output) {
    this._outputs.push(output);
  }

  /**
   * Add a filter chain to the FFmpegCommand object's filter graph
   * @param {FilterGraph} filterChain - filter chain object
   * @returns {void}
   */
  addFilterChain (filterChain) {
    if (typeof this._filterGraph === 'undefined') {
      const FilterGraph = FFmpegCommand._loadFilterGraph();
      this._filterGraph = new FilterGraph();
    }
    this._filterGraph.addFilterChain(filterChain);
  }

  /**
   * Get inputs on the FFmpegCommand object
   *
   * @returns {Array<FFmpegInput>} the inputs
   */
  inputs () {
    return(this._inputs);
  }

  /**
   * Get outputs on the FFmpegCommand object
   *
   * @returns {Array<FFmpegOutput>} the outputs
   */
  outputs () {
    return(this._outputs);
  }

  /**
   * Get the filter graph on the FFmpegCommand object
   *
   * @returns {FilterGraph} the filter graphs
   */
  get filterGraph () {
    return(this._filterGraph);
  }

  /**
   * Get most recent log lines from the ffmpeg run
   * @param {number} n - the number of lines to pull (default: 1)
   * @returns {Array<string>} - the log lines
   */
  logLines (n = 1) {
    return this._progressEmitter.last(n);
  }

  /**
   * Get the currently buffered log data from the ffmpeg run
   * @returns {Array<string>} - the log data
   */
  logData () {
    return this._progressEmitter.logData();
  }

  /**
   * Generate the command representation of the command
   *
   * @returns {Object} - an object containing keys 'command' and 'args'
   */
  toCommand () {
    const result = { command: config.ffmpeg_bin };
    // Handle global options
    let args = [];
    this.options.forEach((value, opt) => {
      args.push(`-${opt}`);
      if (value !== null && value !== undefined) {
        args.push(value.toString());
      }
    });
    // Handle inputs
    for (let input of this._inputs) {
      args = args.concat(input.toCommandArray());
    }
    // Handle filterGraph
    if (typeof this._filterGraph !== 'undefined') {
      args.push('-filter_complex', this.filterGraph.toString());
    }
    // Handle outputs
    for (let output of this._outputs) {
      args = args.concat(output.toCommandArray());
    }
    result.args = args;
    return (result);
  }

  /**
   * Generate the string representation of the command
   *
   * @returns {string} - the command string to be executed
   */
  toString () {
    const cmd = this.toCommand();
    return createCommandString(cmd.command, cmd.args);
  }

  /**
   * Execute the command and return a promise for the output
   *
   * @returns {Promise} - the child_process promise handling the execution
   *
   * @throws {FFmpegError}
   */
  execute () {
    const cmd = this.toCommand();
    return new Promise(function (resolve, reject) {
      cp.execFile(cmd.command, cmd.args, (err, stdout, stderr) => {
        if (err) {
          return reject(new FFmpegError(err));
        }
        resolve({ stderr: stderr, stdout: stdout });
      });
    });
  }

  /**
   * Spawn a child process to execute the command and return the child process
   * @param {boolean} emitEvents - emit events about process state and progress (default: true)
   *
   * @returns {ChildProcess} - the child_process
   */
  spawn (emitEvents = true) {
    // TODO: use pipe:3 for progress events to disambiguate from stderr
    // cannot do this if ffmpeg is run within docker since it cannot attach other fds
    if (emitEvents) {
      if (!this.options.has('progress')) {
        // add more parseable progress output
        this.options.set('progress', 'pipe:2');
      }
    }
    const cmd = this.toCommand();
    const proc = cp.spawn(cmd.command, cmd.args, { stdio: 'pipe' });
    if (emitEvents) {
      this._handleProcessEvents(proc);
      const chunker = new Chunker;
      proc.stderr.pipe(chunker).pipe(this._progressEmitter);
    }
    return proc;
  }

  /**
   * Validate the options passed into the constructor
   * @param {Object} options - the options for the input
   * @returns {Map} - validated options
   */
  static validateOptions (options) {
    // TODO: validate input options here
    if (!(options instanceof Map)) {
      return (new Map(Object.entries(options)));
    }
    return (options);
  }

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
  _handleProcessEvents (proc) {
    proc.on('exit', (code, signal) => {
      if (code === 0 && signal === null) {
        /**
         * 'success' event
         * @description Event indicating the FFmpeg process completed successfully
         * @event FFmpegCommand#success
         * @type {object}
         * @property {number} exitCode - the child process' exit code
         * @property {String} log - full log with ffmpeg times
         * @property {FFmpegProgressEmitter} progress - progress object for more inspection
         */
        this.emit('success', {
          exitCode: code,
          log: this._progressEmitter.formattedLog(),
          progress: this._progressEmitter
        });
      } else {
        /**
         * 'error' event
         * @description Event indicating an error has occurred. If the error occured within the node process while attempting to execute the FFmpeg child process, the type will be `Error`. If the error occurred within the FFmpeg child process, the type will be `FFmpegError`, and will have the listed properties.
         * @event FFmpegCommand#error
         * @type {FFmpegError|Error}
         * @property {number} code - the child process' exit code
         * @property {string|undefined} signal - the signal that caused the process termination, if available
         * @property {String} message - full log with ffmpeg times
         * @property {cmd} cmd - ffmpeg command string
         */
        this.emit('error', new FFmpegError({
          code: code,
          signal: signal,
          cmd: this.toString(),
          progress: this._progressEmitter
        }));
      }
    });
    proc.on('error', (err) => {
      this.emit('error', err);
    });
  }

  /**
   * Load the FFmpegProgressEmitter class and return it
   *
   * @returns {FFmpegProgressEmitter} the FFmpegProgressEmitter class
   *
   * @private
   */
  static _loadFFmpegProgressEmitter () {
    return require('./ffmpeg_progress_emitter');
  }

  /**
   * Load the FilterGraph class and return it
   *
   * @returns {FilterGraph} the FilterGraph class
   *
   * @private
   */
  static _loadFilterGraph () {
    return require('./filter_graph');
  }
}

module.exports = FFmpegCommand;
