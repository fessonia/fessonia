/**
 * @fileOverview lib/ffmpeg_input.ts - Defines and exports the FFmpegInput class
 */

import { inspect } from 'util';
import type { OptionValue } from './ffmpeg_option';
import type { iFilterNode } from './filter_node';
import type { iFilterChain } from './filter_chain';
import type { iFilterGraph } from './filter_graph';
import type { iFFmpegStreamSpecifier } from './ffmpeg_stream_specifier';
import { FilterGraph } from './filter_graph';

import { createCommandString } from './util/command_string_creator';

declare namespace FFmpegInput {
  export type Options = Record<string, OptionValue> | Map<string, OptionValue>;
  export type UrlParam = string | iFilterNode | iFilterChain | iFilterGraph;
  export interface InputSource {
    readonly url: string;
    readonly filterObject?: FilterGraph;
    readonly filterType?: 'FilterGraph';
  }
}

export interface iFFmpegInput extends FFmpegInput.InputSource {
  readonly options: FFmpegInput.Options;
  inputLabel: string;

  streamSpecifier (specifier: string | number): iFFmpegStreamSpecifier;
  toCommandArray (): string[];
  toCommandString (): string;
  toString (): string;
}

export interface FFmpegInputConstructor {
  new(url: FFmpegInput.UrlParam, options?: FFmpegInput.Options)
}

/**
* Class representing an FFmpeg input file (`-i`)
*/
export class FFmpegInput implements iFFmpegInput {
  public readonly url: string;
  public readonly filterObject?: FilterGraph;
  public readonly filterType?: 'FilterGraph';
  public readonly options: FFmpegInput.Options;
  private _inputLabel: string;

  /**
  * Create an input for an FFmpeg command
  * @param {FFmpegInput.UrlParam} url - the address of the input file, or a filter object to use as input
  * @param {FFmpegInput.Options} options - the options for the input
  *
  * @property {string} url - the url for the input, post-validation
  * @property {Object} options - the options for the input, post-validation
  */
  constructor (
    _url: FFmpegInput.UrlParam,
    _options: FFmpegInput.Options = new Map()
  ) {
    const urlValidation = FFmpegInput.validateUrl(_url);
    this.url = urlValidation.url;
    if (urlValidation.filterType) {
      this.filterType = urlValidation.filterType;
    }
    if (urlValidation.filterObject) {
      this.filterObject = urlValidation.filterObject;
    }
    logger.debug(`Pre-validation: ${inspect(_options)}`);
    this.options = FFmpegInput.validateOptions(_options);
    logger.debug(`Post-validation: ${inspect(this.options)}`);
    this._inputLabel = null;
  }

  /**
  * Return the label for this input object.
  * @returns {string} - the label defined on this object.
  */
  get inputLabel () {
    if (this._inputLabel === null) {
      logger.warn(`Attempt to retrieve inputLabel before one was set on ${inspect(this)}`);
      return undefined;
    }
    return this._inputLabel;
  }

  /**
  * Set the label for this input object.
  * @param {string} newLabel - the new value for the label for this input object.
  */
  set inputLabel (newLabel) {
    const isString = typeof newLabel === 'string';
    const hasToString = newLabel.toString && typeof newLabel.toString === 'function';
    logger.debug(`Setting inputLabel: newLabel = ${inspect(newLabel)}, isString = ${inspect(isString)}, hasToString = ${inspect(hasToString)}, this._inputLabel = ${inspect(this._inputLabel)}`);
    if (isString || hasToString) {
      if (this._inputLabel !== null) {
        logger.warn(`Resetting existing inputLabel value ${this._inputLabel} on ${inspect(this)} to new inputLabel value ${newLabel}.`);
      }
      if (isString) {
        this._inputLabel = newLabel;
      }
      if (hasToString) {
        logger.warn(`Stringifying new inputLabel value for ${inspect(this)}`);
        this._inputLabel = newLabel.toString();
      }
    } else {
      throw new Error('Invalid parameter: unable to stringify value of newLabel.');
    }
  }

  /**
  * Get a stream specifier for a stream on this input
  * @param {string|number} specifier - the stream specifier (stream index, 'v', 'a', 's', 'd', or 't')
  * @returns {FFmpegStreamSpecifier} - the stream specifier object
  */
  streamSpecifier (specifier: string | number): iFFmpegStreamSpecifier {
    let lFFmpegStreamSpecifier;
    import('./ffmpeg_stream_specifier').then(({ FFmpegStreamSpecifier }) => {
      lFFmpegStreamSpecifier = FFmpegStreamSpecifier;
    });
    return new lFFmpegStreamSpecifier(this, specifier);
  }

  /**
  * Generate the command array segment for this FFmpeg input
  * @returns {Array} the command array segment
  */
  toCommandArray (): string[] {
    // Note: FFmpeg options on inputs prepend the -i option
    let cmd = [];
    this.options.forEach((o) => { cmd = cmd.concat(o.toCommandArray()); });
    cmd.push('-i');
    cmd.push(`${this.url}`);
    return cmd;
  }

  /**
  * Generate the command string segment for this FFmpeg input
  * @returns {string} the command string segment
  */
  toCommandString (): string {
    return createCommandString(undefined, this.toCommandArray());
  }

  /**
  * Generate a developer-friendly string representing for this FFmpeg input
  * @returns {string} the string representation
  */
  toString (): string {
    return `FFmpegInput(url: "${this.url}", options: ${inspect(this.options)})`;
  }

  /**
  * Validate the url passed into the constructor
  * @param {FFmpegInput.UrlParam} url - the url for the input
  * @returns {FFmpegInput.InputSource} results of the validation; errors if invalid
  */
  static validateUrl (url: FFmpegInput.UrlParam): FFmpegInput.InputSource {
    if (!url) {
      throw new Error('Invalid arguments: url parameter is required');
    }
    const urlString = url.toString();
    if (typeof url !== 'string') {
      import('./filter_graph').then(({ FilterGraph }) => {
        url = FilterGraph.wrap(url)
        if (url instanceof FilterGraph) {
          logger.debug(`Received filter object as input: converting object ${inspect(url)} to string representation: "${urlString}"`);
          return {
            filterObject: url,
            filterType: 'FilterGraph',
            url: urlString,
          } as FFmpegInput.InputSource;
        } else {
          throw new Error('Unknown input type: should be filter object or string address of file/URL');
        }
      });
    } else {
      return { url: urlString } as FFmpegInput.InputSource;
    }
  }

  /**
  * Validate the options passed into the constructor
  * @param {FFmpegInput.Options} options - the options for the input
  * @returns {Array<FFmpegOption>} array of validated FFmpegOption objects; errors if invalid
  */
  static validateOptions (options: FFmpegInput.Options): iFFmpegOption[] {
    logger.debug(`Validating options: ${inspect(options)}`);
    let opts = options;
    if (!(opts instanceof Map)) {
      logger.debug('Validation: opts is not a Map');
      opts = new Map(Object.entries(options));
    }
    logger.debug(`Mid-validation: ${inspect(opts)}`);
    import('./ffmpeg_option').then(({ FFmpegOption }) => {
      const optsArray: [string, OptionValue][] =
        opts instanceof Map ? Array.from(opts) : opts.entries;
      const optObjects = Array.from(optsArray)
        .map(([name, arg]) => new FFmpegOption(name, arg));
      logger.debug(`Completed validating options: ${JSON.stringify(optObjects)}`);
      return (optObjects);
    });
    throw new Error(`Unable to validate input options: ${options}`);
  }
}
