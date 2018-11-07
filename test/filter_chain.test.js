const chai = require('chai'),
  expect = chai.expect;

const FilterChain = require('../lib/filter_chain');
const FilterNode = require('../lib/filter_node');

let nodes = [
  new FilterNode('cropFilter', {
    filterName: 'crop',
    inputs: [{ alias: 'tmp' }],
    outputs: [{ alias: 'cropped' }],
    args: ['iw', 'ih/2', 0, 0]
  }),
  new FilterNode('vflipFilter', {
    filterName: 'vflip',
    inputs: [{ alias: 'cropped'}],
    outputs: [{ alias: 'flip' }]
  })
];

describe('FilterChain', function () {
  describe('simple FilterChain objects', function () {
    it('creates a FilterChain from a list of FilterNodes', function () {
      const fc = new FilterChain('my_filter_chain', nodes);
      expect(fc).to.be.instanceof(FilterChain);
    });
    it('provides an iterable collection of FilterNodes', function () {
      const fc = new FilterChain('my_filter_chain', nodes);
      expect(fc.filterNodes).to.be.instanceof(Array);
      for (let node of fc.filterNodes) {
        expect(node).to.be.instanceof(FilterNode);
      }
    });
    it('autoConnects nodes when creating a FilterChain', function () {
      const fc = new FilterChain('my_filter_chain', nodes);
      for (let i = 1; i < fc.filterNodes.length; i++) {
        expect(fc.filterNodes[i - 1].nextNode).to.eql(fc.filterNodes[i]);
        expect(fc.filterNodes[i].previousNode).to.eql(fc.filterNodes[i - 1]);
      }
    });
    it('does not autoConnect nodes when autoConnect option is false', function () {
      const fc = new FilterChain('my_filter_chain', nodes, autoConnect = false);
      for (let node of fc.filterNodes) {
        expect(node.previousNode).to.be.null;
        expect(node.nextNode).to.be.null;
      }
    });
    it('fails on non-Array nodes argument', function () {
      expect(() => new FilterChain('bad_filter_chain', {})).to.throw();
    });
    it('fails on non-FilterNode values in nodes argument', function () {
      expect(() => new FilterChain('bad_filter_chain', nodes.concat(['not a node']))).to.throw();
    });
    it('disallows COMPLEX filters in a chain', function () {
      expect(() => new FilterChain('chain_with_complex', nodes.concat([
        new FilterNode('complex', {
          filterName: 'split',
          inputs: [],
          outputs: ['main', 'tmp']
        })
      ]))).to.throw();
    });
    it('allows SOURCE filters first in a chain', function () {
      expect(() => new FilterChain('chain_with_source_first', [
        new FilterNode('source', {
          filterName: 'sine',
          inputs: [],
          outputs: ['tone']
        })
      ].concat(nodes))).to.not.throw();
    });
    it('disallows SOURCE filters not first in a chain', function () {
      expect(() => new FilterChain('chain_with_non_first_source', nodes.concat([
        new FilterNode('source', {
          filterName: 'sine',
          inputs: [],
          outputs: ['tone']
        })
      ]))).to.throw();
    });
    it('allows SINK filters last in a chain', function () {
      expect(() => new FilterChain('chain_with_sink_last', nodes.concat([
        new FilterNode('sink', {
          filterName: 'nullsink',
          inputs: ['main'],
          outputs: []
        })
      ]))).to.not.throw();
    });
    it('disallows SINK filters not last in a chain', function () {
      expect(() => new FilterChain('chain_with_non_last_sink', [
        new FilterNode('sink', {
          filterName: 'nullsink',
          inputs: ['main'],
          outputs: []
        })
      ].concat(nodes))).to.throw();
    });
  });
});
