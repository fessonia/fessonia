export = getConfig;
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
declare function getConfig(options?: any): any;
