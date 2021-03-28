import FFmpegOption = require('./ffmpeg_option');
import FFmpegStreamSpecifier = require('./ffmpeg_stream_specifier');

export = FFmpegOutput;

/** Class representing an FFmpeg output file */
declare class FFmpegOutput {
    constructor(url: string, options?: FFmpegOutput.Options);

    addOptions(options: FFmpegOutput.Options): void;
    addStream(streamSpecifier: FFmpegStreamSpecifier): void;
    addStreams(streamSpecifiers: FFmpegStreamSpecifier[]): void;
}

declare namespace FFmpegOutput {
    export type Options = Map<string, FFmpegOption.OptionValue> | { [key: string]: FFmpegOption.OptionValue };
}
