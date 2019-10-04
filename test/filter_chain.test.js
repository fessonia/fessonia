const chai = require('chai'),
  expect = chai.expect,
  sinon = require('sinon'),
  fs = require('fs');

const FilterChain = require('../lib/filter_chain');
const FFmpegInput = require('../lib/ffmpeg_input');
const FilterNode = require('../lib/filter_node');
const FFmpegStreamSpecifier = require('../lib/ffmpeg_stream_specifier');
const filtersFixture = fs.readFileSync(`${__dirname}/fixtures/ffmpeg-filters.out`).toString();

describe('FilterChain', () => {
  beforeEach(() => {
    // stub for ffmpeg interaction
    sinon.stub(FilterNode, '_queryFFmpegForFilters').returns(filtersFixture);
    cropFilter = new FilterNode('crop', ['iw', 'ih/2', 0, 0]);
    vflipFilter = new FilterNode('vflip');
    splitFilter = new FilterNode('split', [], { outputsCount: 2 });
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
  it('disallows adding more inputs than pads available', () => {
    const fc = new FilterChain(nodes);
    const inputStreams = [
      ffmpegInput.streamSpecifier('v:0'),
      ffmpegInput.streamSpecifier('a:1'),
      ffmpegInput.streamSpecifier('a:2')
    ];
    expect(() => fc.addInputs(inputStreams)).to.throw();
  });
  it('disallows non-FFmpegStreamSpecifier inputs', () => {
    const fc = new FilterChain(nodes);
    expect(() => fc.addInputs(['not a stream specifier'])).to.throw();
  });

  describe('streamSpecifier()', () => {
    it('returns a streamSpecifer with the proper specifier', () => {
      const fc = new FilterChain(nodes);
      const streamSpecifier = fc.streamSpecifier(1);
      expect(streamSpecifier).to.be.instanceof(FFmpegStreamSpecifier);
      expect(streamSpecifier.specifier).to.eql('1');
    });

    it('returns a streamSpecifer with the default specifier if not provided', () => {
      const fc = new FilterChain(nodes);
      const streamSpecifier = fc.streamSpecifier();
      expect(streamSpecifier).to.be.instanceof(FFmpegStreamSpecifier);
      expect(streamSpecifier.specifier).to.eql('0');
    });
  });

  describe('getOutputPad()', () => {
    it('returns the requested output pad label', () => {
      const fc = new FilterChain(nodes);
      expect(fc.getOutputPad(0)).to.eql(`${splitFilter.padPrefix}_0`);
    })
  });
  describe('toString()', () => {
    it('returns the correct string representation', () => {
      const fc = new FilterChain(nodes);
      const expected = `${cropFilter.toString()},${vflipFilter.toString()},${splitFilter.toString()}[${splitFilter.padPrefix}_0][${splitFilter.padPrefix}_1]`;
      expect(fc.toString()).to.eql(expected);
    });
    it('returns the correct string representation with inputs', () => {
      const fc = new FilterChain(nodes);
      const inputStream = ffmpegInput.streamSpecifier('v')
      fc.addInputs([inputStream]);
      ffmpegInput.inputLabel = 1;
      const expected = `[1:v]${cropFilter.toString()},${vflipFilter.toString()},${splitFilter.toString()}[${splitFilter.padPrefix}_0][${splitFilter.padPrefix}_1]`
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
      let expected = `life=size=320x240:mold=10:rate=23.976:ratio=0.5:death_color=#C83232:life_color=#00ff00:stitch=0,scale=1920:1080[${scaleFilter.padPrefix}_0]`;
      expect(fc.toString()).to.eql(expected);
    });
    it('generative audio filter to be used as input', function () {
      let sineFilter = new FilterNode('sine', {
        frequency: 620,
        beep_factor: 4,
        duration: 9999999999,
        sample_rate: 48000
      });
      let expected = `sine=frequency=620:beep_factor=4:duration=9999999999:sample_rate=48000[${sineFilter.padPrefix}_0]`;
      let fc = new FilterChain([sineFilter]);
      expect(fc.toString()).to.eql(expected);
    });
  });
});
