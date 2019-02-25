const chai = require('chai'),
  expect = chai.expect,
  fs = require('fs'),
  sinon = require('sinon');

const FilterChain = require('../lib/filter_chain');
const FilterNode = require('../lib/filter_node');
const filtersFixture = fs.readFileSync(`${__dirname}/fixtures/ffmpeg-filters.out`).toString();

describe('FilterChain', function () {
  describe('simple FilterChain objects', function () {
    this.beforeEach(() => {
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
  
    this.afterEach(() => {
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
      const fc = new FilterChain('my_filter_chain', nodes, null, [[['cropFilter', '0'], ['vflipFilter', '0']]]);
      expect(fc.connections).to.be.instanceof(Map);
      expect(fc.connections.has('cropFilter')).to.be.true;
      expect(fc.connections.get('cropFilter')).to.be.instanceof(Map);
      expect(fc.connections.get('cropFilter').has('0')).to.be.true;
      expect(fc.connections.get('cropFilter').get('0')).to.be.an('object');
      expect(fc.connections.get('cropFilter').get('0')).to.have.own.property('vflipFilter');
      expect(fc.connections.get('cropFilter').get('0').vflipFilter).to.eql('0');
    });
    it('generates a string representation of the chain', function () {
      const connections = [
        [['cropFilter', '0'], ['splitFilter', '0']],
        [['splitFilter', '0'], ['vflipFilter', '0']],
        [['splitFilter', '1'], ['vflipFilter', '0']]
      ];
      const fc = new FilterChain('my_filter_chain', nodes, null, connections);
      // console.log(fc.rootNodes);
      const expected = 'crop=iw:ih/2:0:0 [cropFilter_0];[cropFilter_0] split [splitFilter_0] [splitFilter_1];[splitFilter_0] vflip;[splitFilter_1] vflip';
      expect(fc.toString()).to.eql(expected);
    });
  });
  
  describe('example filter chains from real use', function () {
    it('generative video filter to be used as an input', function () {
      let expected = 'life=size=320x240:mold=10:rate=23.976:ratio=0.5:death_color=#C83232:life_color=#00ff00:stitch=0 [life_0];[life_0] scale=1920:1080';
      let nodes = [
        new FilterNode('life', {
          filterName: 'life',
          args: [
            { name: 'size', value: '320x240' },
            { name: 'mold', value: 10 },
            { name: 'rate', value: 23.976 },
            { name: 'ratio', value: 0.5 },
            { name: 'death_color', value: '#C83232' },
            { name: 'life_color', value: '#00ff00' },
            { name: 'stitch', value: 0 }
          ]
        }),
        new FilterNode('scale', {
          filterName: 'scale',
          args: [1920, 1080]
        })
      ];
      let connections = [[['life', '0'], ['scale', '0']]];
      let fc = new FilterChain('my_input_filter', nodes, null, connections);
      expect(fc.toString()).to.eql(expected);
    });
    it('generative audio filter to be used as input', function () {
      let expected = 'sine=frequency=620:beep_factor=4:duration=9999999999:sample_rate=48000';
      let node = new FilterNode('sine', {
        filterName: 'sine',
        args: [
          { name: 'frequency', value: 620 },
          { name: 'beep_factor', value: 4 },
          { name: 'duration', value: 9999999999 },
          { name: 'sample_rate', value: 48000 }
        ]
      });
      let fc = new FilterChain('my_chain', [node], null, []);
      expect(fc.toString()).to.eql(expected);
    });
  });
});
