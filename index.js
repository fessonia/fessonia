/**
 * @description "Fessonia"
 * @author "Ryan B. Harvey <ryan.b.harvey@ted.com>"
 */

const getFessonia = (opts = {}) => {
  const config = require('./lib/util/config')(opts);
  const Fessonia = {
    FFmpegCommand: require('./lib/ffmpeg_command'),
    FFmpegInput: require('./lib/ffmpeg_input'),
    FFmpegOutput: require('./lib/ffmpeg_output'),
    FFmpegOption: require('./lib/ffmpeg_option'),
    FFmpegStreamSpecifier: require('./lib/ffmpeg_stream_specifier'),
    FilterNode: require('./lib/filter_node'),
    FilterChain: require('./lib/filter_chain'),
    FilterGraph: require('./lib/filter_graph'),
    FFmpegProgressEmitter: require('./lib/ffmpeg_progress_emitter'),
    Config: config
  };
  return Fessonia;
}

module.exports = getFessonia;
