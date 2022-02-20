const chai = require('chai'),
  expect = chai.expect,
  sinon = require('sinon'),
  fs = require('fs');

const FilterGraph = require('../lib/filter_graph');
const FilterChain = require('../lib/filter_chain');
const FFmpegInput = require('../lib/ffmpeg_input');
const FilterNode = require('../lib/filter_node');
const FFmpegStreamSpecifier = require('../lib/ffmpeg_stream_specifier');

describe('FilterChain', () => {
  beforeEach(() => {
    cropFilter = new FilterNode('crop', ['iw', 'ih/2', 0, 0]);
    vflipFilter = new FilterNode('vflip');
    splitFilter = new FilterNode('split');
    nodes = [cropFilter, vflipFilter, splitFilter];
    ffmpegInput = new FFmpegInput('/some/uri');
  });
  it('creates an FilterChain object', () => {
    expect(new FilterChain(nodes)).to.be.instanceof(FilterChain);
  });
  it('disallows creating an empty FilterChain', () => {
    expect(() => { new FilterChain([]) }).to.throw()
  });
  it('disallows creating a FilterChain with non-FilterNode objects', () => {
    expect(() => { new FilterChain('not an array') }).to.throw();
    expect(() => { new FilterChain([1, 2, 3]) }).to.throw();
    expect(() => { new FilterChain([cropFilter, 'abcdef', splitFilter]) }).to.throw();
  })
  it('allows adding inputs', () => {
    const fc = new FilterChain(nodes);
    const inputStream = ffmpegInput.streamSpecifier('v');
    expect(() => fc.addInputs([inputStream])).not.to.throw();
    expect(fc.inputs).to.contain(inputStream);
  });
  it('disallows non-FFmpegStreamSpecifier inputs', () => {
    const fc = new FilterChain(nodes);
    expect(() => fc.addInputs(['not a stream specifier'])).to.throw();
  });

  describe('appendNodes()', () => {
    it('adds additional nodes to the end of the nodes array', () => {
      const chain = new FilterChain([cropFilter]);
      chain.appendNodes(vflipFilter, splitFilter);
      expect(chain.nodes).to.eql([cropFilter, vflipFilter, splitFilter]);
    });

    it('supports appending one node', () => {
      const chain = new FilterChain([cropFilter]);
      chain.appendNodes(vflipFilter);
      expect(chain.nodes).to.eql([cropFilter, vflipFilter]);
    });
  });

  describe('prependNodes()', () => {
    it('adds additional nodes to the beginning of the nodes array', () => {
      const chain = new FilterChain([cropFilter]);
      chain.prependNodes(vflipFilter, splitFilter);
      expect(chain.nodes).to.eql([vflipFilter, splitFilter, cropFilter]);
    });

    it('supports prepending one node', () => {
      const chain = new FilterChain([cropFilter]);
      chain.prependNodes(vflipFilter);
      expect(chain.nodes).to.eql([vflipFilter, cropFilter]);
    });
  });

  describe('streamSpecifier()', () => {
    it('returns a streamSpecifer with the proper specifier', () => {
      const fc = new FilterChain(nodes);
      const streamSpecifier = fc.streamSpecifier();
      expect(streamSpecifier).to.be.instanceof(FFmpegStreamSpecifier);
      expect(streamSpecifier.specifier).to.eql('0');
    });

    it('returns the next specifier', () => {
      const fc = new FilterChain(nodes);
      fc.streamSpecifier();
      const streamSpecifier = fc.streamSpecifier();
      expect(streamSpecifier).to.be.instanceof(FFmpegStreamSpecifier);
      expect(streamSpecifier.specifier).to.eql('1');
    });
  });

  describe('getOutputPad()', () => {
    it('returns the requested output pad label', () => {
      const fc = new FilterChain(nodes);
      expect(fc.getOutputPad('0')).to.eql('chain0_split_0');
    });

    it('returns a name based on the last output node', () => {
      const fc = new FilterChain(nodes);
      const mock = sinon.mock(splitFilter);
      mock.expects('getOutputPad').once().withArgs('0').returns('splitFilterOutput');
      expect(fc.getOutputPad('0')).to.eql('chain0_splitFilterOutput');
      mock.verify();
    });

    it('returns a name based on the chain position', () => {
      const fc = new FilterChain(nodes);
      const mock = sinon.mock(fc);
      mock.expects('position').once().returns(24);
      expect(fc.getOutputPad('0')).to.eql('chain24_split_0');
      mock.verify();
    });
  });

  describe('position', () => {
    it('should return 0 if not in a FilterGraph', () => {
      const fc = new FilterChain(nodes);
      expect(fc.filterGraph).to.be.undefined;
      expect(fc.position()).to.eql(0);
    });

    it('should return the result of its FilterGraph\'s chainPosition', () => {
      const fg = new FilterGraph;
      const fc = new FilterChain(nodes);
      fg.addFilterChain(fc);
      const mock = sinon.mock(fg);
      mock.expects('chainPosition').once().withArgs(fc).returns(20);
      expect(fc.position()).to.eql(20);
      mock.verify();
    });
  });

  describe('toString()', () => {
    it('returns the correct string representation', () => {
      const fc = new FilterChain(nodes);
      const expected = `${cropFilter.toString()},${vflipFilter.toString()},${splitFilter.toString()}`;
      expect(fc.toString()).to.eql(expected);
    });
    it('returns the correct string representation with inputs', () => {
      const fc = new FilterChain(nodes);
      const inputStream = ffmpegInput.streamSpecifier('v')
      fc.addInputs([inputStream]);
      ffmpegInput.inputLabel = 1;
      const expected = `[1:v]${cropFilter.toString()},${vflipFilter.toString()},${splitFilter.toString()}`
      expect(fc.toString()).to.eql(expected);
    });
  });

  describe('example filter graphs from real use', function () {
    it('generative video filter to be used as an input', function () {
      let lifeFilter = new FilterNode('life', {
        size: '320x240',
        mold: 10,
        rate: 23.976,
        ratio: 0.5,
        death_color: '#C83232',
        life_color: '#00ff00',
        stitch: 0
      });
      let scaleFilter = new FilterNode('scale', [1920, 1080]);
      let nodes = [lifeFilter, scaleFilter];
      let fc = new FilterChain(nodes);
      let expected = 'life=size=320x240:mold=10:rate=23.976:ratio=0.5:death_color=#C83232:life_color=#00ff00:stitch=0,scale=1920:1080';
      expect(fc.toString()).to.eql(expected);
    });
    it('generative audio filter to be used as input', function () {
      let sineFilter = new FilterNode('sine', {
        frequency: 620,
        beep_factor: 4,
        duration: 9999999999,
        sample_rate: 48000
      });
      let expected = 'sine=frequency=620:beep_factor=4:duration=9999999999:sample_rate=48000';
      let fc = new FilterChain([sineFilter]);
      expect(fc.toString()).to.eql(expected);
    });
  });
});
