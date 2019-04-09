/**
 * FFmpeg Filter Chain module.
 * @module filter_chain
 */

const config = new require('./util/config')(),
  logger = config.logger('FilterChain'),
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
 * @property {Array<FilterNode>} nodes - filter nodes used in this chain
 * @property {Array<FilterNode>} roots - aliases of filter nodes which are inputs of the chain
 * @property {Map<FilterNode, Map<integer, FilterNode>>} connections - connections between nodes in the chain
 * 
 * @method connectNodes
 * @method toString
 */
class FilterChain {
  /**
   * Create a filter chain for use in an FFmpeg filter graph
   * @param {string} alias - a user-defined alias for this chain/graph
   * @param {Array} nodes - an Array of nodes for the filter chain
   * @param {Array} roots - an Array of root nodes of the chain (optional, default: first node in nodes)
   * @param {Map} connections - a Map specifying connections between FilterNode objects (optional, default: empty Map)
   */
  constructor (alias, nodes, roots = null, connections = []) {
    this.alias = alias;
    this.nodes = this.validateNodeTypes(nodes);
    if (roots !== null) {
      this.rootNodes = roots;
    } else {
      this.rootNodes = [nodes[0]];
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
   * @returns {Array<FilterNode>} nodes, validated
   */
  validateNodeTypes (nodes) {
    // logger.info(`validating chain nodes: ${logger.format(nodes)}`);
    const nodeTypesValid = Array.isArray(nodes) && nodes.every((n) => n instanceof FilterNode);
    if (!nodeTypesValid) {
      throw new Error('Error constructing FilterChain: nodes is not an Array of FilterNode objects.');
    }

    return (nodes);
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
    // console.log(`findOutputNodes() :: START :: outNodes = ${JSON.stringify(outNodes)}`);
    this.connections.forEach((padMap, fromAlias) => {
      padMap.forEach((toEntry, fromIndex) => {
        // console.log(`findOutputNodes() :: fromAlias = ${fromAlias}, fromIndex = ${fromIndex}, outNodes = ${JSON.stringify(outNodes)}`);
        let nodeIndex = outNodes.indexOf((nEntr, nIdx, nArr) => nEntr[0] === fromAlias);
        if (nodeIndex && nodeIndex !== -1) {
          // console.log(`findOutputNodes() :: removing node at index ${nodeIndex} from ${JSON.stringify(outNodes)}`);
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
            name: `${n.filterName}_${p}${pi}`,
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
      logger.warn(`Unable to connect node ${logger.format(nodeOut)} at pad index ${nodeOutIndex}: not enough output pads.`);
      validConnection = false;
    }
    if (nodeInIndex >= nodeIn.inputsCount && nodeIn.inputType !== 'N') {
      logger.warn(`Unable to connect node ${logger.format(nodeIn)} at pad index ${nodeInIndex}: not enough input pads.`);
      validConnection = false;
    }
    if (validConnection) {
      let outConnections;
      const connectTo = new Map([[nodeIn, nodeInIndex],]);
      // logger.info(`connectTo = ${logger.format(connectTo)}`);
      if (this.connections.has(nodeOut)) {
        outConnections = this.connections.get(nodeOut);
        if (outConnections.has(nodeOutIndex)) {
          logger.warn(`Overwriting connection from ${logger.format(nodeOut)} at pad index ${nodeOutIndex}`);
        }
        outConnections.set(nodeOutIndex, connectTo);
      } else {
        outConnections = new Map([[nodeOutIndex, connectTo]]);
      }
      logger.info(`Connecting node ${logger.format(nodeOut)} at pad index ${nodeOutIndex} to node ${logger.format(nodeIn)} at index ${nodeInIndex}: ${logger.format(outConnections)}`);
      this.connections.set(nodeOut, outConnections);
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
      logger.warn('Parameter connections is invalid. Should be an Array: [ [ [ filterNode1, "0" ], [ filterNode2, "3" ] ], ... ]');
      return;
    }
    connections.forEach((c) => {
      const from = c[0], to = c[1],
        fromNode = from[0], fromIndex = from[1],
        toNode = to[0], toIndex = to[1],
        existingNodes = this.nodes.includes(fromNode) && this.nodes.includes(toNode);
      // logger.info(`Processing ${c} == ${fromNode}:${fromIndex} => ${toNode}:${toIndex}: existingNodes = ${existingNodes}`);
      if (existingNodes) {
        // connection between nodes in this chain
        this.connectNodes(fromNode, fromIndex, toNode, toIndex);
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
    this.rootNodes.forEach((rootNode, rootNodeIndex) => {
      logger.info(`toString() > this.rootNodes.forEach: rootNode = ${logger.format(rootNode)}`);
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
    logger.info(`SC2S (L${distFromSubchainRoot}, node ${node.padPrefix}): node = ${logger.format(node)}, ins = ${logger.format(ins)}, outs = ${logger.format(outs)}`);
    let str = (ins === null ? '' : ins.map((e) => `[${e}] `).join(''));
    str += node.toString();
    // str += node.outputs.map((_e, i) => ` [${node.padPrefix}_${i}]`).join('');
    let connsFromNode = this.connections.get(node);
    if (connsFromNode && connsFromNode.size > 0) {
      logger.info(`SC2S (L${distFromSubchainRoot}, node ${node.padPrefix}): connsFromNode (truthy) = ${logger.format(connsFromNode)}`);
      
      connsFromNode = [...connsFromNode.entries()].map((outPadToInEntry) => {
        const currentOutputPad = outPadToInEntry[0];
        const currentMappedInputMap = outPadToInEntry[1];
        let connectedNodes = [...currentMappedInputMap.entries()]
          .map((inNodeInPadPair) => {
            const n = inNodeInPadPair[0], i = inNodeInPadPair[1];
            return {
              node: n,
              padIndex: i,
              padName: `${n.padPrefix}_${i}`
            };
          }); // Array of {node: inNode, padIndex: inPad, padName: pad_name_str}
        let connectedNode;
        if (Array.isArray(connectedNodes)) {
          if (connectedNodes.length === 1) {
            connectedNode = connectedNodes[0];
          } else {
            throw new Error(`Output pad ${node.padPrefix}_${currentOutputPad} can only be mapped to a single input pad on another node.`);
          }
        } else {
          connectedNode = connectedNodes;
        }
        logger.info(`SC2S (L${distFromSubchainRoot}, node ${node.padPrefix}): In map of connections: currentOutputPad = ${currentOutputPad}, connectedNode = ${logger.format(connectedNode)}, currentMappedInputMap = ${logger.format(currentMappedInputMap)}`);
        return { fromPad: currentOutputPad, toNode: connectedNode };
      });
      let segmentOuts = [];
      connsFromNode.forEach((padMapping) => {
        segmentOuts.push({
          from: `${node.padPrefix}_${padMapping.fromPad}`,
          to: padMapping.toNode.padName
        });
      });
      segmentOuts.forEach((outputMapping) => {
        str += ` [${outputMapping.from}]`;
      });
      connsFromNode.forEach((padMapping) => {
        logger.info(`SC2S (L${distFromSubchainRoot}, node ${node.padPrefix}): in mapping of connsFromNode... padMapping = ${logger.format(padMapping)}`);
        if (padMapping.toNode) {
          const newIns = segmentOuts
            .filter((outputMapping) =>
              outputMapping.to === padMapping.toNode.padName);
          logger.info(`SC2S (L${distFromSubchainRoot}, node ${node.padPrefix}): in mapping of connsFromNode, constructing inputs for next node... segmentOuts = ${logger.format(padMapping)}, newIns = ${logger.format(newIns)}`);
          str += `;${this._subchainToString(
            padMapping.toNode.node,
            newIns.map((outputMapping) => outputMapping.from),
            null,
            distFromSubchainRoot + 1
          )}`;
        }
      });
    }
    str += (outs === null ? '' : outs.map((e) => ` [${e}]`).join(''));
    logger.info(`SC2S (L${distFromSubchainRoot}, node ${node.padPrefix}): returning '${str}'`);
    return str;
  }

  /**
   * Returns an array of leaf nodes starting from the given node
   * @param {FilterNode} node - the node to start the sub-chain from
   * @param {Array} ins - the input pad links for this sub-chain (nullable)
   * @param {Array} outs - the output pad names for this sub-chain (optional, default: incremented values)
   * @param {Array} leaves - the accumulator array (optional, default: [])
   * @param {integer} distFromSubchainRoot - (optional, default: 0) used for tail recursion tracking
   * 
   * @returns {string} the string representation of the sub-chain
   */
  _subchainLeafNodes (node, ins = null, outs = null, leaves = [], distFromSubchainRoot = 0) {
    logger.info(`SLN (L${distFromSubchainRoot}, node ${node.padPrefix}): node = ${logger.format(node)}, ins = ${logger.format(ins)}, outs = ${logger.format(outs)}`);
    let str = '';
    let nodeOutputs = node.outputs.map((_e, i) => `${node.padPrefix}_${i}`);
    let leafNodes = leaves.concat(nodeOutputs);
    let connsFromNode = this.connections.get(node);
    if (connsFromNode && connsFromNode.size > 0) {
      logger.info(`SLN (L${distFromSubchainRoot}, node ${node.padPrefix}): connsFromNode (truthy) = ${logger.format(connsFromNode)}`);
      
      connsFromNode = [...connsFromNode.entries()].map((outPadToInEntry) => {
        const currentOutputPad = outPadToInEntry[0];
        const currentMappedInputMap = outPadToInEntry[1];
        let connectedNodes = [...currentMappedInputMap.entries()]
          .map((inNodeInPadPair) => {
            const n = inNodeInPadPair[0], i = inNodeInPadPair[1];
            return {
              node: n,
              padIndex: i,
              padName: `${n.padPrefix}_${i}`
            };
          }); // Array of {node: inNode, padIndex: inPad, padName: pad_name_str}
        let connectedNode;
        if (Array.isArray(connectedNodes)) {
          if (connectedNodes.length === 1) {
            connectedNode = connectedNodes[0];
          } else {
            throw new Error(`Output pad ${node.padPrefix}_${currentOutputPad} can only be mapped to a single input pad on another node.`);
          }
        } else {
          connectedNode = connectedNodes;
        }
        logger.info(`SLN (L${distFromSubchainRoot}, node ${node.padPrefix}): In map of connections: currentOutputPad = ${currentOutputPad}, connectedNode = ${logger.format(connectedNode)}, currentMappedInputMap = ${logger.format(currentMappedInputMap)}`);
        return { fromPad: currentOutputPad, toNode: connectedNode };
      });
      let segmentOuts = [];
      connsFromNode.forEach((padMapping) => {
        segmentOuts.push({
          from: `${node.padPrefix}_${padMapping.fromPad}`,
          to: padMapping.toNode.padName
        });
      });
      segmentOuts.forEach((outputMapping) => {
        str += ` [${outputMapping.from}]`;
        const leafPos = leafNodes.indexOf(outputMapping.from);
        const removed = leafNodes.splice(leafPos, 1);
        logger.info(`SLN (L${distFromSubchainRoot}, node ${node.padPrefix}): in forEach of segmentOuts... removed node ${removed} from leafNodes.`);
      });
      connsFromNode.forEach((padMapping) => {
        logger.info(`SLN (L${distFromSubchainRoot}, node ${node.padPrefix}): in mapping of connsFromNode... padMapping = ${logger.format(padMapping)}`);
        if (padMapping.toNode) {
          const newIns = segmentOuts
            .filter((outputMapping) =>
              outputMapping.to === padMapping.toNode.padName);
          logger.info(`SLN (L${distFromSubchainRoot}, node ${node.padPrefix}): in mapping of connsFromNode, constructing inputs for next node... segmentOuts = ${logger.format(padMapping)}, newIns = ${logger.format(newIns)}`);
          str += `;${this._subchainToString(
            padMapping.toNode.node,
            newIns.map((outputMapping) => outputMapping.from),
            null,
            leafNodes,
            distFromSubchainRoot + 1
          )}`;
        }
      });
    }
    // str += (outs === null ? '' : outs.map((e) => ` [${e}]`).join(''));
    logger.info(`SLN (L${distFromSubchainRoot}, node ${node.padPrefix}): returning '${leafNodes}'`);
    return leafNodes;
  }
}

module.exports = FilterChain;
