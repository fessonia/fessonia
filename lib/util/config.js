const CONFIG_KEY = Symbol.for('FFmpegFiltergraph.Config');
const DEFAULTS = {
  ffmpeg_bin: '/usr/local/bin/ffmpeg',
  ffprobe_bin: '/usr/local/bin/ffprobe',
  logger: require('./logger')
};
const configLogger = DEFAULTS.logger('config');
const _configData = global[CONFIG_KEY] || DEFAULTS;

const updateConfigWithOptions = function (options) {
  Object.keys(DEFAULTS).forEach((key) => {
    if (!this.hasOwnProperty(key)) {
      Object.defineProperty(this, key, {
        get: () => _configData[key]
      });
    }
  });
  Object.keys(options).forEach((key) => {
    _configData[key] = options[key];
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
 * * `logger` - a function that creates a logger object (see <code>getLogger</code>)
 * @see getLogger
 * 
 * @function
 * @param {Object} options - (optional) options object (default: {})
 * 
 * @returns {Object} - singleton object with config data
 */
function getConfig (options = {}) {
  try {
    updateConfigWithOptions(options);
    global[CONFIG_KEY] = _configData;
    configLogger.info(`Created config object: ${configLogger.format(global[CONFIG_KEY])}`);
  } catch (e) {
    configLogger.warn(`Invalid attempt to update frozen configuration. Using current config: ${configLogger.format(global[CONFIG_KEY])}`);
  }
  return global[CONFIG_KEY];
};

module.exports = getConfig;
