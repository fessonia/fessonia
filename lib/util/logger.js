// const config = require('./config')();
const path = require('path');

/**
 * Base context for this logger - defaults to app name via npm; app name per package.json; then "application"
 */
const npmPkgName = process.env.npm_package_name;
let pkgJsonName;
try {
  pkgJsonName = require(path.join(path.dirname(require.main.filename), 'package.json')).name;
} catch (e) {
  pkgJsonName = undefined;
}
let baseContext = ( npmPkgName ? npmPkgName : ( pkgJsonName ? pkgJsonName : 'application'));
module.exports.baseContext = baseContext;

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
    if (!!_parent && !(_parent instanceof DefaultLogger)) {
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
    console.log.apply(console, args);
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

  /**
   * Format any object (including nested ones) for readable output in the logs
   * @param {any} stuff - the thing to be formatted for inclusion in the logs
   * 
   * @return {string} formatted string version of the input
   */
  format (stuff) {
    if (typeof stuff === 'undefined' || stuff === null) {
      return stuff;
    }
    if (typeof stuff === 'string') {
      return `"${stuff}"`;
    }
    if (Array.isArray(stuff)) {
      return `[${stuff.map((e) => this.format(e)).join(',')}]`;
    }
    if (stuff instanceof Map) {
      return `Map${this.format([...stuff.entries()])}`;
    }
    if (typeof stuff === 'function') {
      return 'function (...) {...}';
    }
    if (typeof stuff === 'object') {
      if (typeof stuff.inspect === 'function') {
        return stuff.inspect();
      }
      return `{${Object.keys(stuff).map((k) => (stuff.hasOwnProperty(k) ? `"${k}": ${this.format(stuff[k])}` : ''))}}`;
    }
    return stuff.toString();
  }
}

/**
 * Get a logger instance
 * @param {string} context - context name for the logger
 * @param {class} loggerType - the logger class to use when creating a logger (optional, default: DefaultLogger, requires: parentLogger = null)
 * @param {DefaultLogger} parentLogger - the logger instance for which you would like to create a child logger (optional, default: base logger created by this module)
 * 
 * @returns {Object} logger instance
 */
const getLogger = function (context = 'root',
  loggerType = DefaultLogger,
  parentLogger = module.exports.baseLogger) {
  if (parentLogger === null || typeof parentLogger === 'undefined') {
    return new loggerType(`${module.exports.baseContext}:${context}`);
  } else if (parentLogger.hasOwnProperty('child')) {
    return parentLogger.child(`${module.exports.baseContext}:${context}`);
  }
  return parentLogger;
}; 

/**
 * Create the base logger.
 */
let logger;
if (module.exports.baseLogger === undefined) {
  logger = new DefaultLogger(`${module.exports.baseContext}:root`, null);
  module.exports.baseLogger = logger;
  logger.info(`Created logger and registered as base logger: ${logger.format(logger)}`);
} else {
  logger = module.exports.baseLogger;
  logger.info(`Using logger already available in config module: ${logger.format(logger)}`)
}

/**
 * Check that all required interface methods exist on the specified logger.
 */
const missing_methods = ['trace', 'debug', 'info', 'warn', 'error', 'fatal']
  .filter((method) => {
    // logger.debug(method, logger, typeof logger[method], logger[method]);
    return (typeof logger[method] !== 'function');
  });

// logger.debug(`filter complete : missing_methods = ${JSON.stringify(missing_methods)}`);
if (missing_methods.length > 0) {
  throw new Error(`Specified logger is missing the following logger interface methods: ${logger.format(missing_methods)}`);
}

module.exports = getLogger;

module.exports.DefaultLogger = DefaultLogger;
