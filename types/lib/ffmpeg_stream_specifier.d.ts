export = FFmpegStreamSpecifier;
/**
 * Class representing an FFmpeg stream specifier
 * @private
 */
declare class FFmpegStreamSpecifier {
    /**
     * Load the FFmpegInput class and return it
     *
     * @returns {FFmpegInput} the FFmpegInput class
     *
     * @private
     */
    private static _loadFFmpegInput;
    /**
     * Load the FilterChain class and return it
     *
     * @returns {FilterChain} the FilterChain class
     *
     * @private
     */
    private static _loadFilterChain;
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
    private constructor();
    entity: any;
    specifier: string;
    entityType: string;
    /**
     * Generate string representation of the stream specifier
     * @returns {string} the stream specifier representation
     */
    toString(): string;
}
