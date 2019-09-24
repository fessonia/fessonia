const CONFIG_KEY = Symbol.for('FFmpegFiltergraph.Config');
const debugFlag = process.env.DEBUG === 'true' || false;
const logWarningsFlag = process.env.LOG_WARNINGS === 'true' || false;
const DEFAULTS = {
  ffmpeg_bin: 'ffmpeg',
  ffprobe_bin: 'ffprobe',
  debug: debugFlag,
  log_warnings: logWarningsFlag,
  logger: require('./logger')({
    debugFlag: debugFlag,
    warnFlag: logWarningsFlag
  })
};

const _configData = global[CONFIG_KEY] || DEFAULTS;

const updateConfigWithOptions = function (options) {
  Object.keys(options).forEach((key) => {
    _configData[key] = options[key];
    if (!this.hasOwnProperty(key)) {
      Object.defineProperty(this, key, {
        get: () => _configData[key]
      });
    }
  });
  Object.keys(DEFAULTS).forEach((key) => {
    if (!this.hasOwnProperty(key)) {
      Object.defineProperty(this, key, {
        get: () => _configData[key]
      });
    }
  });
};

/**
 * Get the config object, optionally updated with new options
 * 
 * Options understood by this configuration object include:
 * * `ffmpeg_bin` - the location of your `ffmpeg` binary
 * * `ffprobe_bin` - the location of your `ffprobe` binary
 * 
 * @function
 * @param {Object} options - (optional) options object (default: {})
 * 
 * @returns {Object} - singleton object with config data
 */
function getConfig (options = {}) {
  if (options !== {}) {
    const util = require('util');
    try {
      const opts = options;
      updateConfigWithOptions(opts);
      global[CONFIG_KEY] = _configData;
      if (process.env.DEBUG) {
        console.debug(`Created config object: ${util.inspect(global[CONFIG_KEY])}`);
      }
    } catch (e) {
      if (process.env.LOG_WARNINGS) {
        console.warn(`Invalid attempt to update frozen configuration. Using current config: ${util.inspect(global[CONFIG_KEY])}`);
      }
    }
  }
  return global[CONFIG_KEY];
};

module.exports = getConfig;
