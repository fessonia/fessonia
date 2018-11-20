const config = require('./config')();

/**
 * Class representing a Console-based default logger.
 */
class DefaultLogger {
  /**
   * Create a new DefaultLogger instance
   * @param {string} context - the context for this logger instance
   * @param {DefaultLogger} _parent - (optional) the parent logger instance
   * 
   */
  constructor (context, _parent = undefined) {
    if (_parent && !(_parent instanceof DefaultLogger)) {
      throw new Error('InvalidArguments: _parent must be an instance of DefaultLogger');
    }
    this.context = context;
    this._parent = _parent;
    this._children = [];
  }

  /**
   * Create a child logger connected to this logger
   * @param {string} context - the context for this logger instance
   * 
   * @returns {DefaultLogger} the logger instance
   */
  child (context) {
    const childLogger = new DefaultLogger(context, _parent = this);
    this._children.push(childLogger);
    return childLogger;
  }

  /**
   * Pass arguments through to trace function on Console
   * @param {...Array} args - All arguments for this function
   * 
   * @returns {undefined} no return value
   */
  trace (...args) {
    // eslint-disable-next-line no-console
    console.trace.apply(console, args);
  }
  /**
   * Pass arguments through to debug function on Console
   * @param {...Array} args - All arguments for this function
   * 
   * @returns {undefined} no return value
   */
  debug (...args) {
    // eslint-disable-next-line no-console
    console.debug.apply(console, args);
  }
  /**
   * Pass arguments through to info function on Console
   * @param {...Array} args - All arguments for this function
   * 
   * @returns {undefined} no return value
   */
  info (...args) {
    // eslint-disable-next-line no-console
    console.info.apply(console, args);
  }
  /**
   * Pass arguments through to warn function on Console
   * @param {...Array} args - All arguments for this function
   * 
   * @returns {undefined} no return value
   */
  warn (...args) {
    // eslint-disable-next-line no-console
    console.warn.apply(console, args);
  }
  /**
   * Pass arguments through to error function on Console
   * @param {...Array} args - All arguments for this function
   * 
   * @returns {undefined} no return value
   */
  error (...args) {
    // eslint-disable-next-line no-console
    console.error.apply(console, args);
  }
  /**
   * Pass arguments through to error function on Console
   * @param {...Array} args - All arguments for this function
   * 
   * @returns {undefined} no return value
   */
  fatal (...args) {
    // eslint-disable-next-line no-console
    console.error.apply(console, args);
  }
}

let logger;
if (config.logger === undefined) {
  logger = new DefaultLogger('ffmpeg-filtergraph:root');
  require('./config')({ logger: logger });
} else {
  logger = config.logger;
}

const missing_methods = ['trace', 'debug', 'info', 'warn', 'error', 'fatal']
  .filter((method) => !logger.hasOwnProperty(method));

if (missing_methods.length > 0) {
  throw new Error(`Specified logger is missing the following logger interface methods: ${missing_methods.join(', ')}`);
}

/**
 * Get a logger instance
 * @param {string} context - context name for the logger
 * 
 * @returns {Object} logger instance
 */
const getLogger = function (context = 'app:root') {
  if (logger.hasOwnProperty('child')) {
    return logger.child(context);
  }
  return logger;
};

module.exports = getLogger;

module.exports.DefaultLogger = DefaultLogger;
