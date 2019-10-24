/**
 * @description "Fessonia"
 * @fileOverview "Fessonia package import and configuration"
 * @author "Ryan B. Harvey <ryan.b.harvey@ted.com>"
 */

/**
 * Main function interface to the library. Returns object of classes when called.
 * @param {Object} opts - an object of configuration options (@see Config)
 * @returns {Object} - the library's interface classes: {@linkcode FFmpegCommand},  {@linkcode FFmpegInput},  {@linkcode FFmpegOutput},  {@linkcode FilterNode},  {@linkcode FilterChain}
 */
const getFessonia = (opts = {}) => {
  require('./lib/util/config')(opts);
  const Fessonia = {
    FFmpegCommand: require('./lib/ffmpeg_command'),
    FFmpegInput: require('./lib/ffmpeg_input'),
    FFmpegOutput: require('./lib/ffmpeg_output'),
    FilterNode: require('./lib/filter_node'),
    FilterChain: require('./lib/filter_chain'),
    FilterGraph: require('./lib/filter_graph')
  };
  return Fessonia;
}

module.exports = getFessonia;
