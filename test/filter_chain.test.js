const chai = require('chai'),
  expect = chai.expect,
  fs = require('fs'),
  sinon = require('sinon');

const FilterChain = require('../lib/filter_chain');
const FilterNode = require('../lib/filter_node');
const filtersFixture = fs.readFileSync(`${__dirname}/fixtures/ffmpeg-filters.out`).toString();

describe('FilterChain', function () {
  describe('simple FilterChain objects', function () {
    this.beforeAll(() => {
      // stub for ffmpeg interaction
      sinon.stub(FilterNode, '_queryFFmpegForFilters')
        .returns(filtersFixture);
      nodes = [
        new FilterNode('cropFilter', {
          filterName: 'crop',
          args: ['iw', 'ih/2', 0, 0]
        }),
        new FilterNode('vflipFilter', { filterName: 'vflip' }),
        new FilterNode('splitFilter', { filterName: 'split' })
      ];
    });
  
    this.afterAll(() => {
      FilterNode._queryFFmpegForFilters.restore();
    });
  
    it('creates a FilterChain from a list of FilterNodes', function () {
      const fc = new FilterChain('my_filter_chain', nodes);
      expect(fc).to.be.instanceof(FilterChain);
    });
    it('provides an iterable collection of FilterNodes', function () {
      const fc = new FilterChain('my_filter_chain', nodes);
      expect(fc.nodes).to.be.instanceof(Map);
      for (let node of fc.nodes.values()) {
        expect(node).to.be.instanceof(FilterNode);
      }
    });
    it('fails on non-Array nodes argument', function () {
      expect(() => new FilterChain('bad_filter_chain', {})).to.throw();
    });
    it('fails on non-FilterNode values in nodes argument', function () {
      expect(() => new FilterChain('bad_filter_chain', nodes.concat(['not a node']))).to.throw();
    });
    it('sets a default root node of the chain', function () {
      const fc = new FilterChain('my_filter_chain', nodes);
      expect(fc.rootNodes).to.eql([ nodes[0].alias ]);
    });
    it('sets node connections on creation', function () {
      const fc = new FilterChain('my_filter_chain', nodes, null, [['cropFilter:0', 'vflipFilter:0']]);
      expect(fc.connections).to.be.instanceof(Map);
      expect(fc.connections.has('cropFilter')).to.be.true;
      expect(fc.connections.get('cropFilter')).to.be.instanceof(Map);
      expect(fc.connections.get('cropFilter').has(0)).to.be.true;
      expect(fc.connections.get('cropFilter').get(0)).to.be.an('object');
      expect(fc.connections.get('cropFilter').get(0)).to.have.own.property('vflipFilter');
      expect(fc.connections.get('cropFilter').get(0).vflipFilter).to.eql(0);
    });
    it('generates a string representation of the chain', function () {
      const connections = [
        ['cropFilter:0', 'splitFilter:0'],
        ['splitFilter:0', 'vflipFilter:0'],
        ['splitFilter:1', 'vflipFilter:0']
      ];
      const fc = new FilterChain('my_filter_chain', nodes, null, connections);
      console.log(fc.rootNodes);
      const expected = 'crop=iw:ih/2:0:0;split [splitFilter_0] [splitFilter_1];[splitFilter_0] vflip;[splitFilter_1] vflip';
      expect(fc.toString()).to.eql(expected);
    });
  });
});
