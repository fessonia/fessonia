const { inspect } = require('util')
/**
 * Class representing an FFmpeg stream specifier
 */
class FFmpegStreamSpecifier {
  /**
   * Create an FFmpegStreamSpecifier object
   * @param {FFmpegInput|FilterChain} entity - the entity on which the stream specifier is applied
   * @param {string|number} specifier - the stream specifier string or stream index
   * 
   * @property {FFmpegInput|FilterChain} entity - the entity on which the stream specifier is applied
   * @property {string} specifier - the stream specifier string
   * @property {string} entityType - the entity's type (either 'FFmpegInput' or 'FilterChain')
   */
  constructor (entity, specifier) {
    const FFmpegInput = FFmpegStreamSpecifier._loadFFmpegInput();
    const FilterChain = FFmpegStreamSpecifier._loadFilterChain();
    this.entity = entity
    this.specifier = specifier.toString()
    this.entityType = entity instanceof FFmpegInput ? 'FFmpegInput' :
      (entity instanceof FilterChain ? 'FilterChain' : undefined)
    if (this.entityType === undefined) {
      throw new Error(`Invalid entity type for entity ${inspect(entity)}: must be either FFmpegInput or FilterChain`)
    }
  }

  /**
   * Generate string representation of the stream specifier
   * @returns {string} the stream specifier representation
   */
  toString () {
    if (this.entityType === 'FFmpegInput') {
      return `${this.entity.inputLabel}:${this.specifier}`
    }
    if (this.entityType === 'FilterChain') {
      const s = this.entity.getOutputPad(this.specifier)
      if (s.startsWith('[') && s.endsWith(']')) {
        return s
      }
      return `[${s}]`
    }
    return this.specifier
  }

  /**
   * Load the FFmpegInput class and return it
   * 
   * @returns {FFmpegInput} the FFmpegInput class
   *
   * @private
   */
  static _loadFFmpegInput () {
    return require('./ffmpeg_input');
  }

  /**
   * Load the FilterChain class and return it
   * 
   * @returns {FilterChain} the FilterChain class
   *
   * @private
   */
  static _loadFilterChain () {
    return require('./filter_chain');
  }
}

module.exports = FFmpegStreamSpecifier
