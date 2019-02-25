module.exports = {
  FFmpegCommand: require('./lib/ffmpeg_command'),
  FFmpegInput: require('./lib/ffmpeg_input'),
  FFmpegOutput: require('./lib/ffmpeg_output'),
  FilterOption: require('./lib/filter_option'),
  FilterNode: require('./lib/filter_node'),
  FilterChain: require('./lib/filter_chain'),
  Util: {
    config: require('./lib/util/config')(),
    logger: require('./lib/util/logger')('ffmpeg-filtergraph:root')
  }
};
