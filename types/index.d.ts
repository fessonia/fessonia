import { FessoniaConfig } from './lib/util/config';
import FFmpegCommand from './lib/ffmpeg_command';
import FFmpegInput from './lib/ffmpeg_input';
import FFmpegOutput from './lib/ffmpeg_output';
import FilterChain from './lib/filter_chain';
import FilterNode from './lib/filter_node';

/** Main function interface to the library. Returns object of classes when called. */
export default function getFessonia(opts?: Partial<Fessonia.ConfigOpts>): Fessonia;

export interface Fessonia {
  FFmpegCommand: typeof FFmpegCommand;
  FFmpegInput: typeof FFmpegInput;
  FFmpegOutput: typeof FFmpegOutput;
  FilterChain: typeof FilterChain;
  FilterNode: typeof FilterNode;
}

// re-export only types (i.e., not constructors) to prevent direct instantiation
import type FFmpegCommandType from './lib/ffmpeg_command';
import type FFmpegError from './lib/ffmpeg_error';
import type FFmpegInputType from './lib/ffmpeg_input';
import type FFmpegOutputType from './lib/ffmpeg_output';
import type FilterNodeType from './lib/filter_node';
import type FilterChainType from './lib/filter_chain';
export namespace Fessonia {
    export type ConfigOpts = Partial<FessoniaConfig>;

    export {
      FFmpegCommandType as FFmpegCommand,
      FFmpegError,
      FFmpegInputType as FFmpegInput,
      FFmpegOutputType as FFmpegOutput,
      FilterChainType as FilterChain,
      FilterNodeType as FilterNode,
    };
}
