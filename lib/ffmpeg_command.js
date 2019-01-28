/**
 * FFmpeg Command module.
 * @module ffmpeg_command
 */

const config = new require('./util/config')(),
  logger = config.logger,
  cp = require('child_process'),
  FFmpegInput = require('./ffmpeg_input'),
  FFmpegOutput = require('./ffmpeg_output');

/**
 * Class representing an FFmpeg command (`ffmpeg ...`)
 * @typedef {Object} FFmpegCommand
 * 
 * @property {Map<string,Object>} options - global options for the command
 * @property {Array<FFmpegInput>} _inputs - input files (with their options) for the command
 * @property {Array<FFmpegOutput>} _outputs - output files (with their options) for the command
 * @property {Map<string,Map<integer,Object>>} _connections - mapped connections between inputs and outputs
 * 
 * @method addInput
 * @method addOutput
 * @method mapIO
 * @method toCommand
 * @method toString
 */
class FFmpegCommand {
  /**
   * Create an FFmpeg command
   * @param {Object} options - the global options for the command
   */
  constructor (options = new Map()) {
    this.options = FFmpegCommand.validateOptions(options);
    this._inputs = [];
    this._outputs = [];
    this._connections = new Map();
  }

  /**
   * Add an input to the FFmpegCommand object
   * @param {FFmpegInput} input - ffmpeg input object
   * 
   * @returns {void}
   */
  addInput (input) { this._inputs.push(input); }

  /**
   * Add an output to the FFmpegCommand object
   * @param {FFmpegOutput} output - ffmpeg output object
   * 
   * @returns {void}
   */
  addOutput (output) { this._outputs.push(output); }

  /**
   * Get inputs on the FFmpegCommand object
   * 
   * @returns {Array<FFmpegInput>} the inputs
   */
  inputs () { return(this._inputs); }

  /**
   * Get outputs on the FFmpegCommand object
   * 
   * @returns {Array<FFmpegOutput>} the outputs
   */
  outputs () { return(this._outputs); }

  /**
   * Add an output to the FFmpegCommand object
   * @param {string} fromTag - the tag to map from
   * @param {integer} fromIndex - the index to map from
   * @param {string} toTag - the tag to map to
   * @param {integer} toIndex - the index to map to
   * 
   * @returns {boolean} true if successful, false otherwise
   */
  mapIO (fromTag, fromIndex, toTag, toIndex) {
    if (!this._connections.has(fromTag)) { this._connections.set(fromTag, new Map()); }
    if (this._connections.get(fromTag).has(fromIndex)) {
      logger.warn(`Overwriting map connection from ${fromTag}:${fromIndex} to ${toTag}:${toIndex}`);
    }
    const toVal = {};
    toVal[toTag] = toIndex;
    this._connections.get(fromTag).set(fromIndex, toVal);
    return true;
  }

  /**
   * Get input to output mappings on the FFmpegCommand object
   * 
   * @returns {Array<FFmpegInput>} the mapped inputs and outputs
   */
  mappedIO () { return(this._connections); }

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
      if (value !== null && value !== undefined) { args.push(String(value)); }
    });
    // Handle inputs
    for (let input of this._inputs) { args.concat(input.toCommandArray()); }
    // Handle maps
    for (let map of this._connections.keys()) {
      // TODO: figure out how to handle these '-map' options
    }
    // Handle outputs
    for (let output of this._outputs) { args.concat(output.toCommandArray()); }
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
    const args = cmd.args
      .map((elt) => elt.startsWith('-') ? elt : `"${elt.replace(/\"/g, '\\"')}"`)
      .join(' ');
    return (`${cmd.command} ${args}`);
  }

  /**
   * Execute the command
   * 
   * @returns {boolean} - true if execution was successful, false otherwise
   */
  execute () {
    const cmd = this.toCommand();
    new Promise(function (resolve, reject) {
      cp.execFile(cmd.command, cmd.args, (err, stdout, stderr) => {
        if (error) { reject(error); return; }
        resolve(stdout);
      });
    })
      .then(function (result) {
        logger.info(result);
        return (true);
      })
      .catch(function (error) {
        logger.error(error.message);
        return (false);
      });
  }

  /**
   * Validate the options passed into the constructor
   * @param {Object} options - the options for the input
   * @return {Map} - validated options
   */
  static validateOptions (options) {
    // TODO: validate input options here
    if (!(options instanceof Map)) {
      return (new Map(Object.entries(options)));
    }
    return (options);
  }
}

module.exports = FFmpegCommand;
