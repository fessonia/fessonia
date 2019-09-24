module.exports = (flags) => {
  if (!flags.hasOwnProperty('debugFlag')) { flags.debugFlag = false; }
  if (!flags.hasOwnProperty('warnFlag')) { flags.warnFlag = false; }

  const logger = {};

  const createGuardedLogger = (loggerMethod, flagName) => {
    return (...args) => {
      /* eslint-disable no-console */
      if (flags[flagName]) { console[loggerMethod](...args); }
      /* eslint-enable no-console */
    };
  };
  
  ['debug', 'trace'].forEach((method) => {
    logger[method] = createGuardedLogger(method, 'debugFlag')
  });
  ['warn', 'error'].forEach((method) => {
    logger[method] = createGuardedLogger(method, 'warnFlag')
  });

  return logger;
};
