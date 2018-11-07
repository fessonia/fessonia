const FilterNode = require('./filter_node');

const FilterChain = function (alias, nodes, autoConnect = true) {
  this.alias = alias;

  validateNodeTypes(nodes);

  if (autoConnect) {
    this._nodes = autoConnectNodes(nodes);
  } else {
    this._nodes = nodes;
  }

  this._next = null;
  this._prev = null;

  Object.defineProperties(this, {
    filterNodes: {
      set: undefined,
      get: () => this._nodes
    },
    previousNode: {
      set: (filterChain) => FilterChain.connectChains(filterChain, this),
      get: () => this._prev
    },
    nextNode: {
      set: (filterChain) => FilterChain.connectChains(this, filterChain),
      get: () => this._next
    }
  });
};

const validateNodeTypes = function (nodes) {
  if (!Array.isArray(nodes)) {
    throw new Error('Error constructing FilterChain: nodes is not an Array of FilterNode objects.');
  }
  let node;
  for (let i = 0; i < nodes.length; i++) {
    node = nodes[i];
    if (!(node instanceof FilterNode)) {
      throw new Error(`Error constructing FilterChain: node '${node.toString()} is not an instance of FilterNode.`);
    }
    if (node.filterCommand === FilterNode.FilterCommands.COMPLEX) {
      throw new Error(`Error constructing FilterChain: node '${node.toString()} is a complex filter with either multiple inputs or multiple outputs.`);
    }
    if (i > 0 && node.filterType === FilterNode.FilterTypes.SOURCE) {
      throw new Error(`Error constructing FilterChain: node '${node.toString()} is a SOURCE type node, and not first in the chain.`);
    }
    if (i < nodes.length - 1 && node.filterType === FilterNode.FilterTypes.SINK) {
      throw new Error(`Error constructing FilterChain: node '${node.toString()} is a SINK type node, and not last in the chain.`);
    }
  }
};

const autoConnectNodes = function (nodes) {
  const connected = nodes.map((n) => Object.assign(new FilterNode(n.alias, n.options), n));
  for (let i = 1; i < nodes.length; i++) {
    FilterNode.connectNodes(connected[i - 1], connected[i]);
  }
  return connected;
};

module.exports = FilterChain;
