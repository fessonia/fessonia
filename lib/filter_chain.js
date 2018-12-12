/**
 * FFmpeg Filter Chain module.
 * @module filter_chain
 */

const config = new require('./util/config')(),
  logger = config.logger,
  FilterNode = require('./filter_node');

/** Class representing an FFmpeg filter chain
 * @typedef {Object} FilterChain
 * 
 * @property {string} alias - an identifier for this chain
 * @property {Map<string, FilterNode>} nodes - filter nodes used in this chain
 * @property {Array<string>} roots - aliases of filter nodes which are inputs of the chain
 * @property {Map<string, Map<integer, FilterNode>>} connections - connections between nodes in the chain
 * 
 * @method connectNodes
 * @method toString
 */
class FilterChain {
  /**
   * Create a filter chain for use in an FFmpeg filter graph
   * @param {string} alias - an identifier for this filter chain
   * @param {Array} nodes - an Array of nodes for the filter chain
   * @param {Array} roots - an Array of node aliases for root nodes of the chain (optional, default: first node in nodes)
   * @param {Map} connections - a Map specifying connections between FilterNode objects (optional, default: empty Map)
   */
  constructor (alias, nodes, roots = null, connections = []) {
    this.alias = alias;
    this.nodes = this.validateNodeTypes(nodes);
    if (roots !== null) {
      this.rootNodes = roots;
    } else {
      this.rootNodes = [nodes[0].alias];
    }
    this.connections = new Map();
    this.processConnections(connections);
  }

  /**
   * Validates FilterNode objects in the nodes collection and returns a keyed Map
   * @param {Array<FilterNode>} nodes - array of FilterNode objects
   * 
   * @returns {Map<string, FilterNode>} nodes, keyed by node alias
   */
  validateNodeTypes (nodes) {
    const nodeTypesValid = Array.isArray(nodes) && nodes.every((n) => n instanceof FilterNode);
    if (!nodeTypesValid) {
      throw new Error('Error constructing FilterChain: nodes is not an Array of FilterNode objects.');
    }

    return (new Map(nodes.map((n) => [n.alias, n])));
  }
  
  /**
   * Connect two nodes in the chain
   * @param {FilterNode} nodeOut - the node to connect output from
   * @param {integer} nodeOutIndex - the stream index to connect from
   * @param {FilterNode} nodeIn - the node to connect input to
   * @param {integer} nodeInIndex - the stream index to connect to
   * 
   * @returns {boolean} true if connection successful; false otherwise
   */
  connectNodes (nodeOut, nodeOutIndex, nodeIn, nodeInIndex) {
    let validConnection = true;
    if (nodeOutIndex >= nodeOut.outputsCount && nodeOut.outputType !== 'N') {
      logger.warn(`Unable to connect node ${nodeOut.alias} at pad index ${nodeOutIndex}: not enough output pads.`);
      validConnection = false;
    }
    if (nodeInIndex >= nodeIn.inputsCount && nodeIn.inputType !== 'N') {
      logger.warn(`Unable to connect node ${nodeIn.alias} at pad index ${nodeInIndex}: not enough input pads.`);
      validConnection = false;
    }
    if (validConnection) {
      let outConnections;
      const connectTo = {};
      connectTo[nodeIn.alias] = nodeInIndex;
      // logger.info(`connectTo = ${JSON.stringify(connectTo)}`);
      if (this.connections.has(nodeOut.alias)) {
        outConnections = this.connections.get(nodeOut.alias);
        if (outConnections.has(nodeOutIndex)) {
          logger.warn(`Overwriting connection from ${nodeOut.alias} at pad index ${nodeOutIndex}`);
        }
        outConnections.set(nodeOutIndex, connectTo);
      } else {
        outConnections = new Map([[nodeOutIndex, connectTo]]);
      }
      logger.info(`Connecting node ${nodeOut.alias} at pad index ${nodeOutIndex} to node ${nodeIn.alias} at index ${nodeInIndex}: ${JSON.stringify(outConnections)}`);
      this.connections.set(nodeOut.alias, outConnections);
    }
    return (validConnection);
  }

  /**
   * Process incoming connections for FilterNode
   * @param {Array<Array<string>>} connections - connections between nodes in the chain
   * 
   * @returns {Map} a Map object with connections between nodes keyed by outgoing node then pad index
   */
  processConnections (connections) {
    let validConnectionsDefinition = Array.isArray(connections) && connections.every((c) => Array.isArray(c));
    connections.every((c) => c.every((s) => {
      const vals = s.split(':');
      if (vals.length !== 2 || isNaN(parseInt(vals[1], 10))) {
        validConnectionsDefinition = false;
      }
    }));
    if (!validConnectionsDefinition) {
      logger.warn('Parameter connections is invalid. Should be an Array: [ [ "alias1:0", "alias2:3" ], ... ]');
      return;
    }
    connections.forEach((c) => {
      const from = c[0].split(':'), to = c[1].split(':'),
        fromAlias = from[0], fromIndex = parseInt(from[1], 10),
        toAlias = to[0], toIndex = parseInt(to[1], 10),
        existingNodes = this.nodes.has(fromAlias) && this.nodes.has(toAlias);
      // logger.info(`Processing ${c} == ${fromAlias}:${fromIndex} => ${toAlias}:${toIndex}: existingNodes = ${existingNodes}`);
      if (existingNodes) {
        // connection between nodes in this chain
        this.connectNodes(this.nodes.get(fromAlias), fromIndex, this.nodes.get(toAlias), toIndex);
      } else {
        // connection from outside into this chain
        // TODO: handle input pads and output pads of chain
      }
    });
  }

  /**
   * Returns a string representation of the filter chain
   * 
   * @returns {string} the filter chain's string representation
   */
  toString () {
    let s = '';
    this.rootNodes.forEach((rootAlias) => {
      s += this._subchainToString(this.nodes.get(rootAlias));
    });
    return (s);
  }

  /**
   * Returns a string representation of a sub-chain of nodes starting from the given node
   * @param {FilterNode} node - the node to start the sub-chain from
   * 
   * @returns {string} the string representation of the sub-chain
   */
  _subchainToString (node) {
    let str = node.toString() + ';';
    const conns = this.connections.get(node.alias);
    logger.info(conns);
    if (conns) {
      let subchainstr = conns.entries()
        .sort((a, b) => a[1] - b[1])
        .map((c) => this._subchainToString(this.nodes.get(c[0])))
        .join(';');
      str += subchainstr;
    }
    logger.info(`Returning: "${str}"`);
    return (str);
  }
}

module.exports = FilterChain;
