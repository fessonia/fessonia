/**
 * @fileOverview lib/util/command_string_creator.js - Defines and exports a utility module
 *                                                    handling command string creation
 */


/**
 * Create a command string from a command and arguments array
 * @param {string} command - the command name
 * @param {Array<string>} args - the array of command arguments
 * @returns {string} - the command string
 */
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
