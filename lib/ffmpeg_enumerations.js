FFmpegEnumerations = {
  /** Enumeration of filter commands */
  FilterCommands: {
    /** Constant value for the '-filter' command option */
    FILTER: '-filter',
    /** Constant value for the '-filter_complex' command option */
    COMPLEX: '-filter_complex',
  },
  /** Enumeration of filter I/O types */
  FilterIOTypes: {
    /** Constant value representing a filter with both input(s) and output(s) */
    GENERIC: 0,
    /** Constant value representing a source filter with only output(s) */
    SOURCE: 1,
    /** Constant value representing a sink filter with only input(s) */
    SINK: 2,
  },
  /** Enumeration of filter media types */
  FilterMediaTypes: {
    /** Constant value representing non-stream-specified media type */
    GENERIC: '',
    /** Constant value representing an audio stream specifier */
    AUDIO: ':a',
    /** Constant value representing a video stream specifier */
    VIDEO: ':v',
  },
};

module.exports = FFmpegEnumerations;
