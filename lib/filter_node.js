const FilterNode = function (alias, options) {
  this.alias = alias;
  this.options = options;
  this.filterCommand = undefined;
  this.filterType = undefined;

  this._next = null;
  this._prev = null;

  Object.defineProperties(this, {
    previousNode: {
      set: (filterNode) => FilterNode.connectNodes(filterNode, this),
      get: () => this._prev
    },
    nextNode: {
      set: (filterNode) => FilterNode.connectNodes(this, filterNode),
      get: () => this._next
    }
  });

  this._validateOptions();

  return this;
};


FilterNode.connectNodes = function (filterNode1, filterNode2) {
  if (filterNode2._prev !== filterNode1) filterNode2._prev = filterNode1;
  if (filterNode1._next !== filterNode2) filterNode1._next = filterNode2;
};

FilterNode.FilterCommands = {};
FilterNode.FilterCommands.FILTER = '-filter';
FilterNode.FilterCommands.COMPLEX = '-filter_complex';

FilterNode.FilterTypes = {};
FilterNode.FilterTypes.GENERIC = 0;
FilterNode.FilterTypes.SOURCE  = 1;
FilterNode.FilterTypes.SINK    = 2;

FilterNode.FilterMediaTypes = {};
FilterNode.FilterMediaTypes.GENERIC = '';
FilterNode.FilterMediaTypes.AUDIO   = ':a';
FilterNode.FilterMediaTypes.VIDEO   = ':v';


FilterNode.prototype.toCommandArray = function () {
  const cmd = [],
    hasInputs = this.filterType === FilterNode.FilterTypes.GENERIC ||
      this.filterType === FilterNode.FilterTypes.SINK,
    hasOutputs = this.filterType === FilterNode.FilterTypes.GENERIC ||
      this.filterType === FilterNode.FilterTypes.SOURCE;
  if (hasInputs) {
    for (let input of this.options.inputs) { cmd.push(`[${input.alias}]`); }
  }
  let filterString = this.options.filterName +
    (this.options.id ? `@${this.options.id}` : '') +
    processFilterArguments(this.options.args);
  cmd.push(filterString);
  if (hasOutputs) {
    for (let output of this.options.outputs) { cmd.push(`[${output.alias}]`); }
  }
  return (cmd);
};

FilterNode.prototype.toCommandString = function () {
  return (this.toCommandArray().join(' '));
};

FilterNode.prototype.toString = function () {
  return `FilterNode("${this.alias}", "${this.toCommandString()}")`;
};

// Helper functions
FilterNode.prototype._validateOptions = function () {
  if (!this.options.hasOwnProperty('filterName')) {
    throw new Error(`FilterNode ${this.alias} options object does not specify a 'filterName' property. Please supply a value for options.filterName when creating the FilterNode.`);
  }
  if (this.options.hasOwnProperty('args')) { processFilterArguments(this.options.args); }
  this.filterCommand = getFilterCommand(this.options);
  this.filterType = getFilterType(this.options);
};

const getFilterCommand = function (opts) {
  // check inputs and outputs
  const hasInputsArray = opts.inputs && Array.isArray(opts.inputs) && opts.inputs.length > 0;
  const hasMultipleInputs = hasInputsArray && opts.inputs.length > 1;
  const hasOutputsArray = opts.outputs && Array.isArray(opts.outputs) && opts.outputs.length > 0;
  const hasMultipleOutputs = hasOutputsArray && opts.outputs.length > 1;
  const isComplex = hasMultipleInputs || hasMultipleOutputs;
  // set filter type
  if (isComplex) { return FilterNode.FilterCommands.COMPLEX; }
  return FilterNode.FilterCommands.FILTER;
};

const getFilterType = function (opts) {
  const hasInputsArray = opts.inputs && Array.isArray(opts.inputs) && opts.inputs.length > 0;
  const hasOutputsArray = opts.outputs && Array.isArray(opts.outputs) && opts.outputs.length > 0;
  if (hasInputsArray) {
    if (hasOutputsArray) { return FilterNode.FilterTypes.GENERIC; }
    else { return FilterNode.FilterTypes.SINK; }
  } else {
    if (hasOutputsArray) { return FilterNode.FilterTypes.SOURCE; }
    else {
      throw new Error(`FilterNode ${this.alias} specified with no inputs and no outputs. Include at least one input or output via the Array-typed properties 'inputs' and 'outputs' of the options object.`);
    }
  }
};

const processFilterArguments = function (args) {
  if (!args) { return (''); }
  let argterms = [], kvargs = [];
  for (let arg of args) {
    switch (typeof arg) {
    case 'object':
      if (arg.hasOwnProperty('name') && arg.hasOwnProperty('value')) {
        kvargs.push(`${arg.name}=${handleArrayArguments(arg.value)}`);
      } else if (Array.isArray(arg)) {
        argterms.push(handleArrayArguments(arg));
      } else {
        throw new Error(`Invalid argument ${arg.toString()} of FilterNode ${this.alias}. Filter arguments should be either a string or an object with keys 'name' and 'value', or in rare cases, an Array.`);
      }
      break;
    case 'string':
    case 'number':
      argterms.push(arg);
      break;
    default:
      throw new Error(`Invalid argument ${arg.toString()} of FilterNode ${this.alias}. Filter arguments should be either a string or an object with keys 'name' and 'value', or in rare cases, an Array.`);
    }
  }
  return('=' + (argterms.concat(kvargs).join(':')));
};

function handleArrayArguments (arg) {
  if (typeof arg === 'object' && Array.isArray(arg)) { return arg.join('|'); }
  return arg;
};

module.exports = FilterNode;
