/**
 * @fileOverview lib/filter_node.js - Defines and exports the FilterNode class
 */

const crypto = require('crypto');
const util = require('util');

const config = require('./util/config')();
const logger = config.logger;

/** Class representing a single node in an FFmpeg filter graph */
class FilterNode {
  /**
   * Create a filter for use in an FFmpeg filter graph
   * @param {string} filterName - the name of the filter
   * @param {Array<any>} args - the arguments for the filter (default: {})
   */
  constructor (filterName, args = []) {
    this._validateOptions(filterName, args);
    this.filterName = filterName;
    this.args = args;

    return this;
  }

  /**
   * Generate the argument string defining this FFmpeg filter node
   * @returns {string} the filter argument string
   */
  toString () {
    return (this.filterName + this._processFilterArguments());
  }

  /**
   * Get the output pad label based on the specifier
   * @param {number|string} specifier the output pad specifier
   * @returns {string} - the output pad label
   */
  getOutputPad (specifier) {
    return `${this.filterName}_${specifier}`;
  }

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
  _validateOptions (filterName, args) {
    if (!filterName) {
      const errMsg = 'FilterNode constructor requires a filterName parameter. Please supply a value for filterName when creating the FilterNode.';
      throw new Error(errMsg);
    }
  }

  /**
   * Generate the FFmpeg-formatted arguments for the filter node
   *
   * @returns {string} - the FFmpeg-formatted arguments string
   *
   * @private
   */
  _processFilterArguments () {
    const args = this.args;
    if (!args) { return (''); }
    let argterms = [], kvargs = [];
    if (Array.isArray(args)) {
      for (let arg of args) {
        switch (typeof arg) {
        case 'object':
          if (Array.isArray(arg)) {
            argterms.push(FilterNode._handleArrayArguments(arg));
          } else {
            for (let key of Object.getOwnPropertyNames(arg)) {
              kvargs.push(`${key}=${FilterNode._handleArrayArguments(arg[key])}`);
            }
          }
          break;
        case 'string':
        case 'number':
          argterms.push(arg);
          break;
        default:
          throw new Error(`Invalid argument ${util.inspect(arg)} of FilterNode ${util.inspect(this)}. Filter arguments should be either a string or an object with keys 'name' and 'value', or in rare cases, an Array.`);
        }
      }
    } else {
      for (let key of Object.getOwnPropertyNames(args)) {
        kvargs.push(`${key}=${FilterNode._handleArrayArguments(args[key])}`);
      }
    }
    const argsString = argterms.concat(kvargs).join(':');
    return(argsString.length > 0 ? '=' + argsString : '');
  }

  /**
   * Process Array-valued arguments to a filter
   * @param {Object} arg - the Array-valued argument data
   *
   * @returns {string} - a the arguments sub-string for the Array-valued argument value
   *
   * @private
   */
  static _handleArrayArguments (arg) {
    if (typeof arg === 'object' && Array.isArray(arg)) { return arg.join('|'); }
    return arg;
  }
}

module.exports = FilterNode;
