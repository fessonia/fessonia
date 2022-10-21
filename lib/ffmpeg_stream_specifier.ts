/**
 * @fileOverview lib/ffmpeg_stream_specifier.js - Defines and exports the FFmpegStreamSpecifier class
 *
 * @private
 */

import { inspect } from 'util';

import type { iFFmpegInput } from './ffmpeg_input';
import type { iFilterChain } from './filter_chain';

export interface iFFmpegStreamSpecifier {
  entity: iFFmpegInput | iFilterChain;
  entityType: 'FFmpegInput' | 'FilterChain';
  specifier: string;

  toString (): string;
}


/**
* Class representing an FFmpeg stream specifier
* @private
*/
export class FFmpegStreamSpecifier {
  private _specifier: string;
  private _entityType: 'FFmpegInput' | 'FilterChain';

  /**
  * Create an FFmpegStreamSpecifier object
  * @param {FFmpegInput|FilterChain} entity - the entity on which the stream specifier is applied
  * @param {string|number} specifier - the stream specifier string or stream index
  *
  * @property {FFmpegInput|FilterChain} entity - the entity on which the stream specifier is applied
  * @property {string} specifier - the stream specifier string
  * @property {string} entityType - the entity's type (either 'FFmpegInput' or 'FilterChain')
  *
  * @private
  */
  constructor (
    public readonly entity: iFFmpegInput | iFilterChain,
    specifier: string | number
  ) {
    import('./ffmpeg_input').then(({ FFmpegInput }) => {
      import('./filter_chain').then(({ FilterChain }) => {
        this._specifier = specifier.toString();
        this._entityType = entity instanceof FFmpegInput ? 'FFmpegInput' :
          (entity instanceof FilterChain ? 'FilterChain' : undefined);
        if (this._entityType === undefined) {
          throw new Error(`Invalid entity type for entity ${inspect(entity)}: must be either FFmpegInput or FilterChain`);
        }
        try {
          this.toString();
        } catch (err) {
          throw new Error(`Invalid specifier ${inspect(specifier)} for entity ${inspect(entity)}: ${err.message}`);
        }
      });
    });
  }

  public get specifier (): string {
    return this._specifier;
  }
  public get entityType (): string {
    return this._entityType;
  }

  /**
  * Generate string representation of the stream specifier
  * @returns {string} the stream specifier representation
  */
  toString (): string {
    if (this.entityType === 'FFmpegInput') {
      return `${this.entity.inputLabel}:${this.specifier}`;
    }
    if (this.entityType === 'FilterChain') {
      return `[${this.entity.getOutputPad(this.specifier)}]`;
    }
    return this.specifier;
  }
}
