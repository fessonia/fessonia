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
      cropFilter = new FilterNode({
        filterName: 'crop',
        args: ['iw', 'ih/2', 0, 0]
      });
      vflipFilter = new FilterNode({ filterName: 'vflip' });
      vflipFilter2 = new FilterNode({ filterName: 'vflip' });
      splitFilter = new FilterNode({ filterName: 'split', outputsCount: 2 });
      nodes = [cropFilter, vflipFilter, splitFilter];
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
      expect(fc.nodes).to.be.instanceof(Array);
      for (let node of fc.nodes) {
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
      expect(fc.rootNodes).to.eql([ nodes[0] ]);
    });
    it('sets node connections on creation', function () {
      const fc = new FilterChain('my_filter_chain', nodes, null, [[[cropFilter, '0'], [vflipFilter, '0']]]);
      expect(fc.connections).to.be.instanceof(Map);
      expect(fc.connections.has(cropFilter)).to.be.true;
      expect(fc.connections.get(cropFilter)).to.be.instanceof(Map);
      expect(fc.connections.get(cropFilter).has('0')).to.be.true;
      expect(fc.connections.get(cropFilter).get('0')).to.be.instanceof(Map);
      expect(fc.connections.get(cropFilter).get('0').has(vflipFilter));
      expect(fc.connections.get(cropFilter).get('0').get(vflipFilter)).to.eql('0');
    });
    // TODO: continue working here once _subchainLeafNodes is working.
    it.skip('provides leaf nodes for the FilterChain', function () {
      const connections = [
        [[cropFilter, '0'], [splitFilter, '0']],
        [[splitFilter, '0'], [vflipFilter, '0']]
      ];
      const fc = new FilterChain('chain_alias', nodes, null, connections);
      expect(fc.leafNodes).to.be.instanceof(Array);
      expect(fc.leafNodes.length).to.eql(2);
      expect(fc.leafNodes).contains(vflipFilter);
      expect(fc.leafNodes).contains(splitFilter);
    });
    it.skip('provides output pads for the FilterChain', function () {
      const connections = [
        [[cropFilter, '0'], [splitFilter, '0']],
        [[splitFilter, '0'], [vflipFilter, '0']]
      ];
      const fc = new FilterChain('chain_alias', nodes, null, connections);
      expect(fc.outputPads).to.be.instanceof(Array);
      // console.log(fc.outputPads);
      expect(fc.outputPads.length).to.eql(2);
      fc.outputPads.forEach((pad) => {
        expect(pad).to.have.ownProperty('name');
        expect(pad).to.have.ownProperty('mapped');
        expect(pad).to.have.ownProperty('streamType');
        expect(pad.name.startsWith('chain_alias_')).to.be.true;
        expect(() => parseInt(pad.name.replace('chain_alias_', ''))).not.to.throw();
      });
    });
    it.skip('marks output pads as mapped', function () {
      const fc = new FilterChain('chain_alias', nodes, null, [[[cropFilter, '0'], [vFlipFilter, '0']]]);
      
    });
    it.skip('provides a non-marked output pad as the next pad', function () {
      const fc = new FilterChain('chain_alias', nodes, null, [[[cropFilter, '0'], [vFlipFilter, '0']]]);

    });
    it('generates a string representation of the chain', function () {
      const nodes = [cropFilter, splitFilter, vflipFilter, vflipFilter2];
      const connections = [
        [[cropFilter, '0'], [splitFilter, '0']],
        [[splitFilter, '0'], [vflipFilter, '0']],
        [[splitFilter, '1'], [vflipFilter2, '0']]
      ];
      const fc = new FilterChain('my_filter_chain', nodes, null, connections);
      // console.log(fc.rootNodes);
      const expected = `crop=iw:ih/2:0:0 [${cropFilter.padPrefix}_0];[${cropFilter.padPrefix}_0] split [${splitFilter.padPrefix}_0] [${splitFilter.padPrefix}_1];[${splitFilter.padPrefix}_0] vflip;[${splitFilter.padPrefix}_1] vflip`;
      expect(fc.toString()).to.eql(expected);
    });
  });

  describe('private interface helper functions', function () {
    this.beforeEach(() => {
      // stub for ffmpeg interaction
      sinon.stub(FilterNode, '_queryFFmpegForFilters')
        .returns(filtersFixture);
      cropFilter = new FilterNode({
        filterName: 'crop',
        args: ['iw', 'ih/2', 0, 0]
      });
      vflipFilter = new FilterNode({ filterName: 'vflip' });
      vflipFilter2 = new FilterNode({ filterName: 'vflip' });
      hflipFilter = new FilterNode({ filterName: 'hflip' });
      hflipFilter2 = new FilterNode({ filterName: 'hflip' });
      splitFilter = new FilterNode({ filterName: 'split', outputsCount: 2 });
    });
  
    this.afterEach(() => {
      FilterNode._queryFFmpegForFilters.restore();
    });
  
    it('correctly generates a subchain string', function () {
      const nodes = [cropFilter, vflipFilter, splitFilter];
      const connections = [
        [[cropFilter, '0'], [splitFilter, '0']],
        [[splitFilter, '0'], [vflipFilter, '0']]
      ];
      const fc = new FilterChain('my_filter_chain', nodes, [cropFilter], connections);
      const subchain = fc._subchainToString(splitFilter, ['crop_0'], null, 1);
      const expected = `[crop_0] split [${splitFilter.padPrefix}_0];[${splitFilter.padPrefix}_0] vflip`;
      expect(subchain).to.be.a('string');
      expect(subchain).to.eql(expected);
    });
    it('correctly generates a subchain string with multiple out pads', function () {
      const nodes = [cropFilter, vflipFilter, splitFilter, hflipFilter];
      const connections = [
        [[cropFilter, '0'], [splitFilter, '0']],
        [[splitFilter, '0'], [vflipFilter, '0']],
        [[splitFilter, '1'], [hflipFilter, '0']]
      ];
      const fc = new FilterChain('my_filter_chain', nodes, [cropFilter], connections);
      const subchain = fc._subchainToString(splitFilter, ['crop_0'], null, 1);
      const expected = `[crop_0] split [${splitFilter.padPrefix}_0] [${splitFilter.padPrefix}_1];[${splitFilter.padPrefix}_0] vflip;[${splitFilter.padPrefix}_1] hflip`;
      expect(subchain).to.be.a('string');
      expect(subchain).to.eql(expected);
    });
    it('correctly generates a subchain string for filter with varying out pads', function () {
      const nodes = [cropFilter, vflipFilter, splitFilter, hflipFilter, vflipFilter2];
      const connections = [
        [[cropFilter, '0'], [splitFilter, '0']],
        [[splitFilter, '0'], [vflipFilter, '0']],
        [[splitFilter, '1'], [hflipFilter, '0']],
        [[splitFilter, '2'], [vflipFilter2, '0']]
      ];
      const fc = new FilterChain('my_filter_chain', nodes, [cropFilter], connections);
      const subchain = fc._subchainToString(splitFilter, ['crop_0'], null, 1);
      const expected = `[crop_0] split [${splitFilter.padPrefix}_0] [${splitFilter.padPrefix}_1] [${splitFilter.padPrefix}_2];[${splitFilter.padPrefix}_0] vflip;[${splitFilter.padPrefix}_1] hflip;[${splitFilter.padPrefix}_2] vflip`;
      expect(subchain).to.be.a('string');
      expect(subchain).to.eql(expected);
    });
    it('correctly generates a string recursively for multi-step subchain', function () {
      const nodes = [cropFilter, vflipFilter, splitFilter, hflipFilter, vflipFilter2, hflipFilter2];
      const connections = [
        [[cropFilter, '0'], [splitFilter, '0']],
        [[splitFilter, '0'], [vflipFilter, '0']],
        [[splitFilter, '1'], [hflipFilter, '0']],
        [[splitFilter, '2'], [vflipFilter2, '0']],
        [[vflipFilter2, '0'], [hflipFilter2, '0']]
      ];
      const fc = new FilterChain('my_filter_chain', nodes, [cropFilter], connections);
      const subchain = fc._subchainToString(splitFilter, ['crop_0'], null, 1);
      const expected = `[crop_0] split [${splitFilter.padPrefix}_0] [${splitFilter.padPrefix}_1] [${splitFilter.padPrefix}_2];[${splitFilter.padPrefix}_0] vflip;[${splitFilter.padPrefix}_1] hflip;[${splitFilter.padPrefix}_2] vflip [${vflipFilter2.padPrefix}_0];[${vflipFilter2.padPrefix}_0] hflip`;
      expect(subchain).to.be.a('string');
      expect(subchain).to.eql(expected);
    });
    // TODO: Continue working here NOW.
    it.skip('computes leaf nodes for the FilterChain', function () {
      const connections = [
        [[cropFilter, '0'], [splitFilter, '0']],
        [[splitFilter, '0'], [vflipFilter, '0']]
      ];
      const fc = new FilterChain('chain_alias', nodes, null, connections);
      const leafNodes = fc._subchainLeafNodes(cropFilter);
      expect(leafNodes).to.be.instanceof(Array);
      expect(leafNodes).to.eql(2);
      expect(fc.leafNodes).contains(`${vflipFilter.padPrefix}_${0}`);
      expect(fc.leafNodes).contains(`${splitFilter.padPrefix}_${1}`);
    });
  });
  
  describe('example filter chains from real use', function () {
    it('generative video filter to be used as an input', function () {
      let lifeFilter = new FilterNode({
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
      });
      let scaleFilter = new FilterNode({
        filterName: 'scale',
        args: [1920, 1080]
      });
      let nodes = [lifeFilter, scaleFilter];
      let connections = [[[lifeFilter, '0'], [scaleFilter, '0']]];
      let fc = new FilterChain('my_input_filter', nodes, null, connections);
      let expected = `life=size=320x240:mold=10:rate=23.976:ratio=0.5:death_color=#C83232:life_color=#00ff00:stitch=0 [${lifeFilter.padPrefix}_0];[${lifeFilter.padPrefix}_0] scale=1920:1080`;
      expect(fc.toString()).to.eql(expected);
    });
    it('generative audio filter to be used as input', function () {
      let expected = 'sine=frequency=620:beep_factor=4:duration=9999999999:sample_rate=48000';
      let node = new FilterNode({
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
