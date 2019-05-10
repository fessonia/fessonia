module.exports = {
  FFmpegCommand: require('./lib/ffmpeg_command'),
  FFmpegInput: require('./lib/ffmpeg_input'),
  FFmpegOutput: require('./lib/ffmpeg_output'),
  FFmpegOption: require('./lib/ffmpeg_option'),
  FilterNode: require('./lib/filter_node'),
  FilterChain: require('./lib/filter_chain'),
  FFmpegProgressEmitter: require('./lib/ffmpeg_progress_emitter'),
  Util: {
    config: require('./lib/util/config')(),
    logger: require('./lib/util/logger')('ffmpeg-filtergraph:root')
  }
};
