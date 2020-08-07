function createCommandString (command, args) {
  const optionPattern = /-[a-z]/;
  const argsString = args
      .map((elt) => optionPattern.test(elt) ? elt : `"${elt.replace(/\"/g, '\\"')}"`)
      .join(' ');
  const cmd = typeof command === 'string' ? `${command} ` : '';
  return (`${cmd}${argsString}`);
}

module.exports = {
  createCommandString
};
