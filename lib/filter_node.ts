/**
 * @fileOverview lib/filter_node.ts - Defines and exports the FilterNode class
 */

import { inspect } from 'util';

declare namespace FilterNode {
  export type FilterArg =
    stringOrNumber | Array<stringOrNumber | stringOrNumber[]> | keyValuePair;
}

export interface iFilterNode {
  readonly filterName: string;
  readonly args: FilterNode.FilterArg;

  toString (): string;
  getOutputPad (specifier: number | string): string;
}

interface keyValuePair {
  name: string;
  value: stringOrNumber | stringOrNumber[];
}

type stringOrNumber = string | number;


/** Class representing a single node in an FFmpeg filter graph */
export class FilterNode implements iFilterNode {
  /**
   * Create a filter for use in an FFmpeg filter graph
   * @param {string} filterName - the name of the filter
   * @param {Array<FilterNode.FilterArg>} args - the arguments for the filter (default: {})
   */
  constructor (
    public readonly filterName: string,
    public readonly args: FilterNode.FilterArg = []
  ) {
    this._validateOptions(filterName, args);
  }

  /**
   * Generate the argument string defining this FFmpeg filter node
   * @returns {string} the filter argument string
   */
  toString (): string {
    return (this.filterName + this._processFilterArguments());
  }

  /**
   * Get the output pad label based on the specifier
   * @param {number|string} specifier the output pad specifier
   * @returns {string} - the output pad label
   */
  getOutputPad (specifier: stringOrNumber): string {
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
  _validateOptions (filterName: string, args: FilterNode.FilterArg) {
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
  _processFilterArguments (): string {
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
          throw new Error(`Invalid argument ${inspect(arg)} of FilterNode ${inspect(this)}. Filter arguments should be either a string or an object with keys 'name' and 'value', or in rare cases, an Array.`);
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
  static _handleArrayArguments (arg: FilterNode.FilterArg | FilterNode.FilterArg[]): string | FilterNode.FilterArg {
    if (typeof arg === 'object' && Array.isArray(arg)) { return arg.join('|'); }
    return arg;
  }
}
