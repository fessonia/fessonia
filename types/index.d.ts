import { FessoniaConfig } from './lib/util/config';
import type FFmpegCommand = require('./lib/ffmpeg_command');
import type FFmpegError = require('./lib/ffmpeg_error');
import type FFmpegInput = require('./lib/ffmpeg_input');
import type FFmpegOutput = require('./lib/ffmpeg_output');
import type FilterChain = require('./lib/filter_chain');
import type FilterNode = require('./lib/filter_node');

/** Main function interface to the library. Returns object of classes when called. */
declare function Fessonia(opts?: Partial<Fessonia.ConfigOpts>): Fessonia;

interface Fessonia {
  FFmpegCommand: typeof FFmpegCommand;
  FFmpegInput: typeof FFmpegInput;
  FFmpegOutput: typeof FFmpegOutput;
  FilterChain: typeof FilterChain;
  FilterNode: typeof FilterNode;
}

declare namespace Fessonia {
    export type ConfigOpts = Partial<FessoniaConfig>;

    export {
      FFmpegCommand,
      FFmpegError,
      FFmpegInput,
      FFmpegOutput,
      FilterChain,
      FilterNode,
    };
}

export = Fessonia;
