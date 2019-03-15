/**
 * FFmpeg Filter Chain module.
 * @module filter_chain
 */

const config = new require('./util/config')(),
  logger = config.logger,
  FilterNode = require('./filter_node');

Array.take = (n, head = true) => {
  const a = [];
  while (n > 0) {
    a.push(head ? this.shift() : this.pop());
    n--;
  }
  return (a);
};

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
    this.leafNodes = this.findOutputNodes();
    this.inputPads = this.processInputPads();
    this.outputPads = this.processOutputPads();
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
   * Processes the FilterChain to find all output (leaf) nodes
   * 
   * @returns {Array<FilterNode>} output (leaf) nodes
   */
  findOutputNodes () {
    if (!(this.nodes instanceof Map && this.nodes.size > 0)) {
      return ([]);
    }
    const outNodes = Array(this.nodes.entries());
    console.log(`findOutputNodes() :: START :: outNodes = ${JSON.stringify(outNodes)}`);
    this.connections.forEach((padMap, fromAlias) => {
      padMap.forEach((toEntry, fromIndex) => {
        console.log(`findOutputNodes() :: fromAlias = ${fromAlias}, fromIndex = ${fromIndex}, outNodes = ${JSON.stringify(outNodes)}`);
        let nodeIndex = outNodes.indexOf((nEntr, nIdx, nArr) => nEntr[0] === fromAlias);
        if (nodeIndex && nodeIndex !== -1) {
          console.log(`findOutputNodes() :: removing node at index ${nodeIndex} from ${JSON.stringify(outNodes)}`);
          let removed = outNodes.splice(nodeIndex, 1);
          if (removed[0] !== fromAlias) {
            throw new Error(`Something wrong happened when finding output nodes! Attempted to remove connected node ${fromAlias} at index ${nodeIndex} but removed node ${removed.alias} instead. outNodes now equals: ${JSON.stringify(outNodes)}`);
          }
        }
      });
    });
    // TODO: handle partially connected nodes where some output pads are connected but others are open?
    return (
      Array(this.nodes.entries())
        .filter((nEntr) => outNodes.includes(nEntr[0]))
        .map((nEntr) => nEntr[1])
    );
  }

  /**
   * Processes the FilterChain to generate input pads
   * 
   * @returns {Array<string|FilterNode>} nodes, keyed by node alias
   */
  processInputPads () {
    const pads = [];
    this.rootNodes.forEach((n) => {
      if (n.inputsCount !== null && n.inputsCount > 0) {
        n.inputs.forEach((p, pi) => {
          pads.push(`${n.alias}_${p}${pi}`);
        });
      } else if (n.inputType === 'N') {
        // TODO: Handle multiple input pads of unknown number
      }
    });
    return (pads);
  }

  /**
   * Processes the FilterChain to generate output pads
   * 
   * @returns {Array<string|FilterNode>} nodes, keyed by node alias
   */
  processOutputPads () {
    const pads = [];
    this.leafNodes.forEach((n) => {
      if (n.outputsCount !== null && n.outputsCount > 0) {
        n.outputs.forEach((p, pi) => {
          pads.push({
            name: `${n.alias}_${pi}`,
            mapped: false,
            streamType: p
          });
        });
      } else if (n.outputType === 'N') {
        // TODO: Handle multiple output pads of unknown number
      }
    });
    return (pads);
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
   * @param {Array<Array<Array<string>>>} connections - connections between nodes in the chain
   * 
   * @returns {Map} a Map object with connections between nodes keyed by outgoing node then pad index
   */
  processConnections (connections) {
    let validConnectionsDefinition =
      // connections is an array of node/stream pairs
      Array.isArray(connections) &&
      // each element of connections is a pair of node/streams arrays
      connections.every((c) => Array.isArray(c) && c.length === 2) &&
      // each element of a pair contains a node and a stream value
      connections.every((c) => c.every((ns) => Array.isArray(ns) && ns.length === 2));
    if (!validConnectionsDefinition) {
      logger.warn('Parameter connections is invalid. Should be an Array: [ [ [ "alias1", "0" ], [ "alias2", "3" ] ], ... ]');
      return;
    }
    connections.forEach((c) => {
      const from = c[0], to = c[1],
        fromAlias = from[0], fromIndex = from[1],
        toAlias = to[0], toIndex = to[1],
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
    let rootNode;
    this.rootNodes.forEach((rootAlias) => {
      rootNode = this.nodes.get(rootAlias);
      s += this._subchainToString(rootNode);
    });
    return (s);
  }

  /**
   * Returns a string representation of a sub-chain of nodes starting from the given node
   * @param {FilterNode} node - the node to start the sub-chain from
   * @param {Array} ins - the input pad links for this sub-chain (nullable)
   * @param {Array} outs - the output pad names for this sub-chain (optional, default: incremented values)
   * @param {integer} distFromSubchainRoot - (optional, default: 0) used for tail recursion tracking
   * 
   * @returns {string} the string representation of the sub-chain
   */
  _subchainToString (node, ins = null, outs = null, distFromSubchainRoot = 0) {
    logger.info(`Processing node ${node.alias}, ${distFromSubchainRoot} away from root`);
    let str = (ins === null ? '' : ins.map((e) => `[${e}] `).join('')) + node.toString();
    // logger.info(` --> ${str}`);
    const conns = this.connections.get(node.alias);
    // logger.info(' -->', conns);
    // logger.info(`${node.alias}, ${distFromSubchainRoot}: connections =`, conns);
    if (conns) {
      const outs = [...conns.keys()].map((k) => `${node.alias}_${k}`);
      if (outs !== null && outs.length > 0) {
        str += outs.map((e) => ` [${e}]`).join('');
      }
      let subchainstr = [...conns.entries()]
        .sort((a, b) => a[0] - b[0])
        .map((c, i) => {
          const nextNode = this.nodes.get(Object.keys(c[1])[0]);
          if (node.outputsCount === null || node.outputsCount > 0) {
            const outLabels = [];
            let n = nextNode.inputsCount;
            while (n > 0) { outLabels.push(outs.shift()); n--; }
            // logger.info(` --> ${JSON.stringify(c)} (${i}): ${nextNode.alias},`, outLabels);
            return (this._subchainToString(nextNode, outLabels, null, distFromSubchainRoot + 1));
          }
          return (this._subchainToString(nextNode, null, null, distFromSubchainRoot + 1));
        })
        .filter((s) => s.length > 0)
        .join(';');
      str += ';' + subchainstr;
    }
    // logger.info(`Returning: "${str}"`);
    return (str);
  }
}

module.exports = FilterChain;
