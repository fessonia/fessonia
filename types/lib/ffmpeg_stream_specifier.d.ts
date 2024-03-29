import FFmpegInput = require('./ffmpeg_input');
import FilterChain = require('./filter_chain');

export = FFmpegStreamSpecifier;

/**
 * Class representing an FFmpeg stream specifier
 * @private
 */
declare class FFmpegStreamSpecifier {
    entity: FFmpegInput | FilterChain;
    entityType: 'FFmpegInput' | 'FilterChain';
    specifier: string;

    /**
     * @param entity the entity on which the stream specifier is applied
     * @param specifier the stream specifier string or stream index
     */
    constructor(entity: FFmpegInput | FilterChain, specifier: string | number);
    toString(): string;
}
