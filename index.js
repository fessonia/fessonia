/**
 * @description "Fessonia"
 * @author "Ryan B. Harvey <ryan.b.harvey@ted.com>"
 */

const getFessonia = (opts = {}) => {
  require('./lib/util/config')(opts);
  const Fessonia = {
    FFmpegCommand: require('./lib/ffmpeg_command'),
    FFmpegInput: require('./lib/ffmpeg_input'),
    FFmpegOutput: require('./lib/ffmpeg_output'),
    FilterNode: require('./lib/filter_node'),
    FilterChain: require('./lib/filter_chain')
  };
  return Fessonia;
}

module.exports = getFessonia;
