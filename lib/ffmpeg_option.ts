/**
 * @fileOverview lib/ffmpeg_option.js - Defines and exports the FFmpegOption class
 *
 * @private
 */

import type { iFilterNode } from './filter_node';
import type { iFilterChain } from './filter_chain';
import type { iFilterGraph } from './filter_graph';

/**
* List of option names that refer to filters
*
* @private
*/

declare namespace FFmpegOption {
  export type OptionValue = string | iFilterNode | iFilterChain | iFilterGraph;
  export type OptionArg = null | OptionValue;
}

const FilterOptionNames: string[] = [
  'filter',
  'filter:v',
  'vf',
  'filter:a',
  'af',
  'filter_complex',
  'lavfi'
];

export interface iFFmpegOption {
  readonly optionName: string;
  readonly name: string;
  readonly arg: FFmpegOption.OptionArg;

  toCommandArray (): [string] | [string, string];
  toCommandString (): string;
  validate (name: string, arg: FFmpegOption.OptionArg): boolean;
}

export interface FFmpegOptionConstructor {
  readonly FilterOptionNames: [
    'filter',
    'filter:v',
    'vf',
    'filter:a',
    'af',
    'filter_complex',
    'lavfi'
  ];

  new(_name: string, _arg: FFmpegOption.OptionArg): FFmpegOption;
}

/**
* Class representing an FFmpeg option
*
* NOTE: This class is for internal use, intended for validation and
* serialization of options added to an FFmpeg command. It is not
* intended for use as a library interface to other code.
*
* @private
*/
export class FFmpegOption implements iFFmpegOption {
  public static readonly FilterOptionNames = FilterOptionNames;
  public readonly name: string;
  public readonly optionName: string;
  public readonly arg: FFmpegOption.OptionArg;

  /**
  * Create an option for an FFmpeg command
  * @param {string} name - the option name
  * @param {FFmpegOption.OptionArg} arg - the argument for this option (default: null)
  */
  constructor (_name: string, _arg: FFmpegOption.OptionArg = null) {
    this.validate(_name, _arg);
    import('./filter_graph').then(({ FilterGraph }) => {
      const isFilter: boolean =
        FFmpegOption.FilterOptionNames.includes(_name) &&
        FilterGraph.wrap(_arg) instanceof FilterGraph;
      if (isFilter) { _name = 'filter_complex'; }
    });
    if (_arg === undefined) { _arg = null; }
    this.arg = _arg;
    this.name = _name;
    this.optionName = `-${_name}`;
  }

  /**
  * Generate the command array segment for this FFmpeg option
  * @returns {Array} the command array segment
  */
  toCommandArray (): [string] | [string, string] {
    if (this.arg === null) { return [this.optionName]; }
    return [this.optionName, this.arg.toString()];
  }

  /**
  * Generate the command string segment for this FFmpeg option
  * @returns {string} the command string segment
  */
  toCommandString (): string {
    if (this.arg === null) { return this.optionName; }
    return `${this.optionName} ${this.arg.toString()}`;
  }

  /**
  * Validate input for this FFmpeg Option
  * @param {string} name - the option name
  * @param {FFmpegOption.OptionArg} arg - the argument for this option
  *
  * @returns {boolean} - validated values; throws error if invalid
  */
  validate (_name: string, arg: FFmpegOption.OptionArg): boolean {
    if (typeof arg !== 'string' && arg !== null) {
      if (arg instanceof Map || Array.isArray(arg)) {
        throw new Error('InvalidArgument: arg must be a string value or null, or must be a single-value type and have a toString method');
        // if toString does not exist or is useless
      } else if (!(arg.toString !== undefined && typeof arg.toString === 'function')) {
        throw new Error('InvalidArgument: arg must be a string value or null, or must have a toString method');
      }
    }

    return true;
  }
}
