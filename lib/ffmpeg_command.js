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
   * @param {null|Array<Array<FilterNode|FilterGraph|FFmpegInput|number>>} mappings - an array of inputs mapped to this output
   * 
   * @returns {void}
   */
  addOutput (output, mappings = null) {
    this._outputs.push(output);
    if (mappings !== null) { this.processMappings(mappings); }
  }

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
   * Get outputs on the FFmpegCommand object
   * @param {Array<Array<FilterNode|FilterGraph|FFmpegInput|integer>>} mappings - an array of input mappings
   * @param {FFmpegOutput} output - the output to map the mappings to
   * 
   * @returns {FFmpegOutput} the output, with mappings assigned
   */
  processMappings (mappings, output) {
    mappings.map((mapping, index) => {
      output.mapTrack(index, this.getMappingParameterValue(mapping));
    });
    return (output);
  }

  /**
   * Get the mapping parameter value for the given output and mapping information
   * @param {FFmpegInput|FilterNode|FilterGraph} fromObject - the object to map from
   * @param {integer} fromStreamIndex - the stream/output pad index to map from
   * 
   * @returns {Array<integer>|string} mapping parameter to add for this output
   */
  getMappingParameterValue (fromObject, fromStreamIndex) {
    if (fromObject instanceof FFmpegInput) {
      let fromObjInputIndex = this._inputs.indexOf(fromObject);
      logger.info(`Searching for fromObject in command inputs: result = ${fromObjInputIndex}`);
      if (fromObjInputIndex === -1) {
        throw new Error(`Unknown input file specified in output mapping: ${fromObject.url}`);
      }
      return [fromObjInputIndex, fromStreamIndex];
    } else if (fromObject instanceof FilterNode || fromObject instanceof FilterGraph) {
      let fromObjectOutputPadName = fromObject.outputPadNames[fromStreamIndex];
      logger.info(`Using filter/FilterGraph output pad name for fromObject: result = ${fromObjectOutputPadName}`);
      fromObject.markOutputPadMapped(fromStreamIndex);
      return fromObjectOutputPadName;
    }
    // If unknown type, throw an error
    throw new Error(`Unknown input type specified in output mapping: ${fromObject.toString()}`);
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
    for (let input of this._inputs) { args = args.concat(input.toCommandArray()); }
    // Handle maps
    for (let map of this._connections.keys()) {
      // TODO: figure out how to handle these '-map' options
      logger.info('toCommand(), handling maps:', map);
      for (let input of this._inputs) {
        // build ordered mapping of input pads
        logger.info('toCommand(), handling maps, inputs loop:', input);
      }
      for (let output of this._outputs) {
        // build ordered mapping of output pads
        logger.info('toCommand(), handling maps, outputs loop:', output);
      }
    }
    // Handle outputs
    for (let output of this._outputs) { args = args.concat(output.toCommandArray()); }
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
   * Execute the command and return a promise for the output
   * 
   * @returns {Promise} - the child_process promise handling the execution
   */
  execute () {
    const cmd = this.toCommand();
    return new Promise(function (resolve, reject) {
      cp.execFile(cmd.command, cmd.args, (err, stdout, stderr) => {
        if (err) { reject({ error: err, stderr: stderr, stdout: stdout }); return; }
        resolve({ stderr: stderr, stdout: stdout });
      });
    });
  }

  /**
   * Spawn a child process to execute the command and return the child process
   * 
   * @returns {ChildProcess} - the child_process
   */
  spawn () {
    const cmd = this.toCommand();
    const proc = cp.spawn(cmd.command, cmd.args, { stdio: 'pipe' });
    return proc;
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
