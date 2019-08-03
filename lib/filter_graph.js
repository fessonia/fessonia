const config = new require('./util/config')(),
  logger = config.logger('FilterGraph');

/** Class representing an FFmpeg filter graph
 */
class FilterGraph {
  /**
   * Create a filter graph for use in an FFmpeg filter graph
   * @param {Array} nodes - an Array of nodes for the filter graph
   * @param {Array} roots - an Array of root nodes of the graph (optional, default: first node in nodes)
   * @param {Map} connections - a Map specifying connections between FilterNode objects (optional, default: empty Map)
   * 
   * @property {string} alias - an identifier for this graph
   * @property {Array<FilterNode>} nodes - filter nodes used in this graph
   * @property {Array<FilterNode>} roots - aliases of filter nodes which are inputs of the graph
   * @property {Map<FilterNode, Map<integer, FilterNode>>} connections - connections between nodes in the graph
   */
  constructor (nodes, roots = null, connections = []) {
    this.nodes = this.validateNodeTypes(nodes);
    if (roots !== null) {
      this.rootNodes = roots;
    } else if (this.nodes.length === 0) {
      this.rootNodes = [];
    } else {
      this.rootNodes = [nodes[0]];
    }
    logger.info(`In constructor: processing connections = ${logger.format(connections)}`);
    this.inputPads = this.processInputPads();
    this.connections = new Map();
    this.processConnections(connections);
    this.leafNodes = this.findOutputNodes();
    this.outputPads = this.processOutputPads();
  }

  /**
   * Validates FilterNode objects in the nodes collection and returns a keyed Map
   * @param {Array<FilterNode>} nodes - array of FilterNode objects
   * 
   * @returns {Array<FilterNode>} nodes, validated
   */
  validateNodeTypes (nodes) {
    // logger.info(`validating graph nodes: ${logger.format(nodes)}`);
    const FilterNode = FilterGraph._loadFilterNode();
    const nodeTypesValid = Array.isArray(nodes) && nodes.every((n) => n instanceof FilterNode);
    if (!nodeTypesValid) {
      throw new Error('Error constructing FilterGraph: nodes is not an Array of FilterNode objects.');
    }

    return (nodes);
  }

  /**
   * Processes the FilterGraph to find all output (leaf) nodes
   * 
   * @returns {Array<Object>} Array of objects with output (leaf) nodes & pad indices
   */
  findOutputNodes () {
    let outNodes = [];
    logger.info(`findOutputNodes: this.rootNodes = ${logger.format(this.rootNodes)}`);
    if (!(Array.isArray(this.rootNodes) && this.rootNodes.length > 0)) {
      return (outNodes);
    }
    this.rootNodes.forEach((rootNode) => {
      outNodes = outNodes.concat(this._subgraphLeafNodes(rootNode));
    });
    return outNodes;
  }

  /**
   * Processes the FilterGraph to generate input pads
   * 
   * @returns {Array<string|FilterNode>} nodes, keyed by node alias
   */
  processInputPads () {
    const pads = [];
    let counter = 0;
    this.rootNodes.forEach((n) => {
      console.log(`>> Iteration ${++counter} | n = ${n} | this.rootNodes = ${this.rootNodes}`);
      if (n.inputsCount !== null && n.inputsCount > 0) {
        n.inputs.forEach((streamType, index) => {
          pads.push(`${n.alias}_${index}${streamType}`);
        });
      } else if (n.inputType === 'N' && n.inputsCount === null) {
        throw new Error(`Unknown number of input pads for variable input filter ${logger.format(n)}.`);
      }
    });
    return (pads);
  }

  /**
   * Processes the FilterGraph to generate output pads
   * 
   * @returns {Array<Object>} Array of node output pad objects
   */
  processOutputPads () {
    const pads = [];
    logger.info(`processOutputPads: this.leafNodes = ${logger.format(this.leafNodes)}`);
    this.leafNodes.forEach((n) => {
      logger.info(`processOutputPads: forEach n: n.node = ${logger.format(n.node)}, n.node.outputsCount = ${n.node.outputsCount}, n.node.outputs = ${n.node.outputs}, n.padIndex = ${n.padIndex}, n.streamType = ${n.streamType}`);
      const outputNodeRecord = {
        node: n.node,
        streamType: n.streamType,
        padIndex: n.padIndex,
        padName: n.padName,
        mapped: false
      };
      pads.push(outputNodeRecord);
    });
    return (pads);
  }

  /**
   * Connect elements of the filter graph
   * @param {Object} opts - the options for the connection (must include 'from' and 'to' keys)
   * 
   * @returns {void}
   */
  connect (opts) {
    if (!opts.hasOwnProperty('from') || !opts.hasOwnProperty('to')) {
      throw new Error(`Invalid options argument ${logger.format(options)} for ${logger.format(this)} 'connect' method.`);
    }
    let fromTrack, toTrack;
    const FFmpegInput = FilterGraph._loadFFmpegInput();
    const FFmpegOutput = FilterGraph._loadFFmpegOutput();
    const FilterNode = FilterGraph._loadFilterNode();
    if (opts.from instanceof FFmpegInput) {
      if (!!opts.fromTrack) { fromTrack = opts.fromTrack }
      else if (!!opts.fromIndex) { fromTrack = opts.fromIndex }
      else if (!!opts.fromStreamType) { fromTrack = opts.fromStreamType }
      else { fromTrack = opts.from.nextAvailableOutputTrack() }
      if (!!opts.toTrack) { toTrack = opts.toTrack }
      else if (!!opts.toIndex) { toTrack = opts.toIndex }
      else if (!!opts.fromStreamType) { toTrack = opts.fromStreamType }
      else { toTrack = opts.from.nextAvailableInputTrack() }
      this.connectInput(opts.from, fromTrack, opts.to, toTrack);
    } else if (opts.to instanceof FFmpegOutput) {
      throw new Error('Not implemented.');
      // TODO: implement this.
    } else if (opts.from instanceof FilterNode && opts.to instanceof FilterNode) {
      fromTrack = (!!opts.fromTrack) ? opts.fromTrack : opts.from.nextAvailableOutputTrack();
      toTrack = (!!opts.toTrack) ? opts.toTrack : opts.to.nextAvailableInputTrack();
      opts.from.markOutputPadMapped(fromTrack);
      opts.to.markInputPadMapped(toTrack);
      this.connectNodes(opts.from, fromTrack, opts.to, toTrack);
    } else {
      throw new Error(`I don't know how to connect ${logger.format(opts.from)} to ${logger.format(opts.to)}.`);
    }
  }
  
  /**
   * Connect two nodes in the graph
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
    logger.info(`In connectNodes(${logger.format(nodeOut)}, ${nodeOutIndex}, ${logger.format(nodeIn)}, ${nodeInIndex}): validConnection = ${validConnection}`);
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
   * Connect an FFmpegInput object to a node in the graph
   * @param {FFmpegInput} input - the input to connect output from
   * @param {integer|string} inputStreamIndexOrType - the stream index or type to connect from
   * @param {FilterNode} nodeIn - the node to connect input to
   * @param {integer} nodeInIndex - the stream index to connect to
   * 
   * @returns {boolean} true if connection successful; false otherwise
   */
  connectInput (input, inputStreamIndexOrType, nodeIn, nodeInIndex) {
    let validConnection = true;
    if (['v', 'a'].includes(inputStreamIndexOrType)) {
      // by Stream Type -- validate compatibility
      const streamType = inputStreamIndexOrType;
      const nodeOutputPadName = `${nodeIn.padPrefix}_${nodeInIndex}${nodeIn.inputs[nodeInIndex].toLowerCase()}`;
      const compatiblePads = this.inputPads.filter((pad) => pad.endsWith(streamType) || pad.endsWith('n'));
      if (!compatiblePads.includes(nodeOutputPadName)) {
        logger.error(`Input stream type ${streamType} not compatible with filter node ${logger.format(nodeIn)} input pad ${nodeInIndex} stream type ${nodeIn.inputs[nodeInIndex.toLowerCase()]}`);
        validConnection = false;
      }
    }
    if (nodeInIndex >= nodeIn.inputsCount && nodeIn.inputType !== 'N') {
      logger.error(`Unable to connect input ${input} to node ${logger.format(nodeIn)} at pad index ${nodeInIndex}: not enough input pads on FilterNode.`);
      validConnection = false;
    }
    if (validConnection) {
      this.connections.set(input, new Map([[inputStreamIndexOrType, new Map([[nodeIn, nodeInIndex]])]]));
    }
    return (validConnection);
  }

  /**
   * Process incoming connections for FilterNode
   * @param {Array<Array<Array<FilterNode|FFmpegInput|integer|string>>>} connections - connections between nodes in the graph
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
      logger.info(`Processing ${logger.format(c)} == ${logger.format(fromNode)}:${fromIndex} => ${logger.format(toNode)}:${toIndex}: existingNodes = ${existingNodes}`);
      if (existingNodes) {
        // connection between nodes in this graph
        logger.format(`Calling connectNodes(${logger.format(fromNode)}, ${fromIndex}, ${logger.format(toNode)}, ${toIndex})`);
        this.connectNodes(fromNode, fromIndex, toNode, toIndex);
      } else {
        // connection from outside into this graph
        const FFmpegInput = FilterGraph._loadFFmpegInput();
        logger.info(`Processing connection from outside ${logger.format(this)}: fromNode = ${logger.format(fromNode)}`);
        // TODO: Currently bombing here `TypeError: Right-hand side of 'instanceof' is not callable`
        logger.info(`ERROR HAPPENS HERE: fromNode = ${logger.format(fromNode)}, FFmpegInput = ${logger.format(FFmpegInput)}`);
        if (fromNode instanceof FFmpegInput) {
          logger.info('fromNode is an FFmpegInput object');
          const fromInput = fromNode;
          if (['v', 'a'].includes(fromIndex)) {
            const streamType = fromIndex;
            if (!(this.inputs.includes(streamType) && this.inputs.includes('n'))) {
              throw new Error(`Mismatched input mapping from input ${fromInput} to filter graph ${logger.format(this)}: input type ${streamType} doesn't match any filter pad types ${logger.format(this.inputs)}`);
            }
            this.connectInput(fromInput, streamType, toNode, toIndex);
          } else {
            // assume numeric stream indexing
            this.connectInput(fromInput, fromIndex, toNode, toIndex);
          }
        }
      }
    });
  }

  /**
   * Returns a string representation of the filter graph
   * 
   * @returns {string} the filter graph's string representation
   */
  toString () {
    let s = '';
    this.rootNodes.forEach((rootNode, rootNodeIndex) => {
      logger.info(`toString() > this.rootNodes.forEach: rootNode = ${logger.format(rootNode)}`);
      s += this._subgraphToString(rootNode);
    });
    return (s);
  }

  /**
   * Returns a string representation of a sub-graph of nodes starting from the given node
   * @param {FilterNode} node - the node to start the sub-graph from
   * @param {Array} ins - the input pad links for this sub-graph (nullable)
   * @param {Array} outs - the output pad names for this sub-graph (optional, default: incremented values)
   * @param {integer} distFromSubgraphRoot - (optional, default: 0) used for tail recursion tracking
   * 
   * @returns {string} the string representation of the sub-graph
   *
   * @private
   */
  _subgraphToString (node, ins = null, outs = null, distFromSubgraphRoot = 0) {
    logger.debug(`SC2S (L${distFromSubgraphRoot}, node ${node.padPrefix}): node = ${logger.format(node)}, ins = ${logger.format(ins)}, outs = ${logger.format(outs)}`);
    let str = (ins === null ? '' : ins.map((e) => `[${e}] `).join(''));
    str += node.toString();
    // str += node.outputs.map((_e, i) => ` [${node.padPrefix}_${i}]`).join('');
    let connsFromNode = this.connections.get(node);
    if (connsFromNode && connsFromNode.size > 0) {
      logger.debug(`SC2S (L${distFromSubgraphRoot}, node ${node.padPrefix}): connsFromNode (truthy) = ${logger.format(connsFromNode)}`);
      
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
        logger.debug(`SC2S (L${distFromSubgraphRoot}, node ${node.padPrefix}): In map of connections: currentOutputPad = ${currentOutputPad}, connectedNode = ${logger.format(connectedNode)}, currentMappedInputMap = ${logger.format(currentMappedInputMap)}`);
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
        logger.debug(`SC2S (L${distFromSubgraphRoot}, node ${node.padPrefix}): in mapping of connsFromNode... padMapping = ${logger.format(padMapping)}`);
        if (padMapping.toNode) {
          const newIns = segmentOuts
            .filter((outputMapping) =>
              outputMapping.to === padMapping.toNode.padName);
          logger.debug(`SC2S (L${distFromSubgraphRoot}, node ${node.padPrefix}): in mapping of connsFromNode, constructing inputs for next node... segmentOuts = ${logger.format(padMapping)}, newIns = ${logger.format(newIns)}`);
          str += `;${this._subgraphToString(
            padMapping.toNode.node,
            newIns.map((outputMapping) => outputMapping.from),
            null,
            distFromSubgraphRoot + 1
          )}`;
        }
      });
    }
    str += (outs === null ? '' : outs.map((e) => ` [${e}]`).join(''));
    logger.debug(`SC2S (L${distFromSubgraphRoot}, node ${node.padPrefix}): returning '${str}'`);
    return str;
  }

  /**
   * Returns an array of leaf nodes starting from the given node
   *  1) add all output pads of current node to leafNodes
   *  2) iterate through connections, doing the following for each:
   *     2a) remove/trim the output pad from which the connection is made
   *     2b) recursively process the connected node's output pads, adding the output to the return array
   * @param {FilterNode} node - the node to start the sub-graph from
   * @param {integer} distFromSubgraphRoot - (optional, default: 0) used for tail recursion tracking
   * 
   * @returns {string} the string representation of the sub-graph
   *
   * @private
   */
  _subgraphLeafNodes (node, distFromSubgraphRoot = 0) {
    logger.debug(`\n\nSLN (L${distFromSubgraphRoot}, node ${node.padPrefix}): START node = ${logger.format(node)}`);
    let leafNodes = node.outputs.map((_e, i) => {
      return { node: node, padIndex: i, streamType: node.outputs[i].toLowerCase(), padName: `${node.padPrefix}_${i}` };
    });
    logger.debug(`SLN (L${distFromSubgraphRoot}, node ${node.padPrefix}): leafNodes = ${logger.format(leafNodes)}`);
    let connsFromNode = this.connections.get(node);
    // logger.debug(`SLN (L${distFromSubgraphRoot}, node ${node.padPrefix}): connsFromNode = ${logger.format(connsFromNode)}, this.connections = ${logger.format(this.connections)}`);
    if (connsFromNode && connsFromNode.size > 0) {
      // logger.debug(`SLN (L${distFromSubgraphRoot}, node ${node.padPrefix}): connsFromNode (truthy) = ${logger.format(connsFromNode)}`);
      
      connsFromNode = [...connsFromNode.entries()].map((outPadToInEntry) => {
        // For each pad...
        const currentOutputPad = outPadToInEntry[0];
        const currentMappedInputMap = outPadToInEntry[1];
        // logger.debug(`SLN (L${distFromSubgraphRoot}, node ${node.padPrefix}): currentOutputPad = ${currentOutputPad}, currentMappedInputMap = ${logger.format(currentMappedInputMap)}`);
        let connectedNodes = [...currentMappedInputMap.entries()]
          .map((inNodeInPadPair) => {
            const n = inNodeInPadPair[0],
              i = inNodeInPadPair[1],
              connectedNodeRecord = {
                node: n,
                padIndex: i,
                streamType: n.outputs[i].toLowerCase(),
                padName: `${n.padPrefix}_${i}`
              };
            // logger.debug(`SLN (L${distFromSubgraphRoot}, node ${node.padPrefix}): connectedNodeRecord = ${logger.format(connectedNodeRecord)}`);
            return connectedNodeRecord;
          }); // Array of {node: inNode, padIndex: inPad, streamType: s, padName: pad_name_str}
        let connectedNode;
        logger.debug(`SLN (L${distFromSubgraphRoot}, node ${node.padPrefix}): working output pad ${currentOutputPad} mapped to ${logger.format(currentMappedInputMap)}, connectedNodes = ${logger.format(connectedNodes)}`);
        if (Array.isArray(connectedNodes)) { // this should be true
          if (connectedNodes.length === 1) { // this should be true too
            connectedNode = connectedNodes[0];
          } else {
            throw new Error(`Output pad ${node.padPrefix}_${currentOutputPad} can only be mapped to a single input pad on another node.`);
          }
        } else {
          throw new Error(`Type Error when retrieving output pad ${node.padPrefix}_${currentOutputPad} mapping.`);
          // connectedNode = connectedNodes;
        }
        logger.debug(`SLN (L${distFromSubgraphRoot}, node ${node.padPrefix}): Completed iteration of connection: ${currentOutputPad} => ${logger.format(connectedNode)}, currentMappedInputMap = ${logger.format(currentMappedInputMap)}`);
        const fromNode = {
          node: node,
          outputPad: currentOutputPad,
          streamType: node.outputs[currentOutputPad],
          padName: `${node.padPrefix}_${currentOutputPad}`
        };
        return { fromNode: fromNode, toNode: connectedNode };
      });
      connsFromNode.forEach((padMapping) => {
        logger.debug(`SLN (L${distFromSubgraphRoot}, node ${node.padPrefix}): in forEach of connsFromNode... recursive execution for connection ${logger.format(padMapping)}`);
        leafNodes = leafNodes.concat(this._subgraphLeafNodes(padMapping.toNode.node, distFromSubgraphRoot + 1));
        logger.debug(`SLN (L${distFromSubgraphRoot}, node ${node.padPrefix}): in forEach of connsFromNode... completed recursive execution for connection ${logger.format(padMapping)}: leafNodes = ${logger.format(leafNodes)}`);
        // TODO: look for match in structure { node, padIndex, streamType, padName }
        const leafPos = leafNodes.findIndex((nodeRecord) => {
          const found = padMapping.fromNode.padName === nodeRecord.padName;
          logger.debug(`SLN (L${distFromSubgraphRoot}, node ${node.padPrefix}): in findIndex within forEach of connsFromNode... found? ${found}; nodeRecord = ${logger.format(nodeRecord)}; padMapping.fromNode = ${logger.format(padMapping.fromNode)}`);
          return found;
        });
        logger.debug(`SLN (L${distFromSubgraphRoot}, node ${node.padPrefix}): in forEach of connsFromNode... leafPos = ${leafPos}`);
        if (leafPos >= 0) {
          logger.debug(`SLN (L${distFromSubgraphRoot}, node ${node.padPrefix}): in forEach of connsFromNode... identified node record ${logger.format(leafNodes[leafPos])} at index ${leafPos} of leafNodes for removal`);
          const removed = leafNodes.splice(leafPos, 1);
          logger.debug(`SLN (L${distFromSubgraphRoot}, node ${node.padPrefix}): in forEach of connsFromNode... removed node ${logger.format(removed)} from leafNodes; leafNodes = ${logger.format(leafNodes)}`);
        }
      });
      logger.debug(`SLN (L${distFromSubgraphRoot}, node ${node.padPrefix}): completed all connections, leafNodes = ${logger.format(leafNodes)}`);
    }
    logger.debug(`SLN (L${distFromSubgraphRoot}, node ${node.padPrefix}): returning '${logger.format(leafNodes)}'\n`);
    return leafNodes;
  }

  /**
   * Load the FilterNode class and return it
   * 
   * @returns {FilterNode} - the FilterNode class
   *
   * @private
   */
  static _loadFilterNode () {
    return require('./filter_node');
  }

  /**
   * Load the FFmpegInput class and return it
   * 
   * @returns {FFmpegInput} - the FFmpegInput class
   *
   * @private
   */
  static _loadFFmpegInput () {
    return require('./ffmpeg_input');
  }

  /**
   * Load the FFmpegOutput class and return it
   * 
   * @returns {FFmpegOutput} - the FFmpegOutput class
   *
   * @private
   */
  static _loadFFmpegOutput () {
    return require('./ffmpeg_output');
  }
}

module.exports = FilterGraph;
