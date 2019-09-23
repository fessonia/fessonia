module.exports = (flags) => {
  if (!flags.hasOwnProperty('debugFlag')) { flags.debugFlag = false; }
  if (!flags.hasOwnProperty('warnFlag')) { flags.warnFlag = false; }

  const logger = {};

  const createGuardedLogger = (loggerMethod, flagName) => {
    return (...args) => {
      if (flags[flagName]) { console[loggerMethod](...args); }
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
