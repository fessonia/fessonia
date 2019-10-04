const chai = require('chai'),
  expect = chai.expect,
  sinon = require('sinon'),
  fs = require('fs');

const FFmpegStreamSpecifier = require('../lib/ffmpeg_stream_specifier');
const FFmpegInput = require('../lib/ffmpeg_input');
const FilterChain = require('../lib/filter_chain');
const FilterNode = require('../lib/filter_node');
const filtersFixture = fs.readFileSync(`${__dirname}/fixtures/ffmpeg-filters.out`).toString();

describe('FFmpegStreamSpecifier', () => {
  beforeEach(() => {
    // stub for ffmpeg interaction
    sinon.stub(FilterNode, '_queryFFmpegForFilters').returns(filtersFixture);
    cropFilter = new FilterNode('crop', ['iw', 'ih/2', 0, 0]);
    vflipFilter = new FilterNode('vflip');
    splitFilter = new FilterNode('split', [], { outputsCount: 2 });
    filterChain = new FilterChain([cropFilter, vflipFilter, splitFilter])
    ffmpegInput = new FFmpegInput('/some/uri')
  });
  it('creates an FFmpegStreamSpecifier object with a FilterChain', () => {
    expect(new FFmpegStreamSpecifier(filterChain, 0))
      .to.be.instanceof(FFmpegStreamSpecifier);
  });
  it('creates an FFmpegStreamSpecifier object with an FFmpegInput', () => {
    expect(new FFmpegStreamSpecifier(ffmpegInput, 0))
      .to.be.instanceof(FFmpegStreamSpecifier);
    expect(new FFmpegStreamSpecifier(ffmpegInput, 'v'))
      .to.be.instanceof(FFmpegStreamSpecifier);
    expect(new FFmpegStreamSpecifier(ffmpegInput, 'a'))
      .to.be.instanceof(FFmpegStreamSpecifier);
    expect(new FFmpegStreamSpecifier(ffmpegInput, '0:v'))
      .to.be.instanceof(FFmpegStreamSpecifier);
    expect(new FFmpegStreamSpecifier(ffmpegInput, 'v:1'))
      .to.be.instanceof(FFmpegStreamSpecifier);
  });
  describe('toString()', () => {
    it('returns the correct stream specifier for a FilterChain', () => {
      const s1 = new FFmpegStreamSpecifier(filterChain, 0)
      expect(s1.toString()).to.eql(`[${splitFilter.padPrefix}_0]`)
      const s2 = new FFmpegStreamSpecifier(filterChain, 1)
      expect(s2.toString()).to.eql(`[${splitFilter.padPrefix}_1]`)
    });
    it('returns the correct stream specifier for an FFmpegInput', () => {
      const s1 = new FFmpegStreamSpecifier(ffmpegInput, 1)
      ffmpegInput.inputLabel = 2
      expect(s1.toString()).to.eql('2:1')
      const s2 = new FFmpegStreamSpecifier(ffmpegInput, 'a')
      expect(s2.toString()).to.eql('2:a')
      const s3 = new FFmpegStreamSpecifier(ffmpegInput, 'v:0')
      expect(s3.toString()).to.eql('2:v:0')
    })
  })
});
