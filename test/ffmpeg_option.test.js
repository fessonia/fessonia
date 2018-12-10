const chai = require('chai'),
  expect = chai.expect,
  testHelpers = require('./helpers');

const FFmpegOption = require('../lib/ffmpeg_option');

describe('FFmpegOption', function () {
  it('provides option contexts', function () {
    expect(FFmpegOption.FFmpegOptionContexts).to.not.be.null;
  });
  it('creates an FFmpegOption object', function () {
    expect(new FFmpegOption(
      'ss',
      FFmpegOption.FFmpegOptionContexts.GLOBAL
    )).to.be.instanceof(FFmpegOption);
  });
  it('does not fail if the context is valid', function () {
    const C = FFmpegOption.FFmpegOptionContexts;
    expect(() => new FFmpegOption('y', C.GLOBAL)).not.to.throw;
    expect(() => new FFmpegOption('ss', C.INPUT)).not.to.throw;
    expect(() => new FFmpegOption('ss', C.OUTPUT)).not.to.throw;
  });
  it('fails if the context is invalid', function () {
    expect(() => new FFmpegOption('ss', false)).to.throw;
  });
  it('does not fail if args is a Map', function () {
    const C = FFmpegOption.FFmpegOptionContexts;
    expect(() => new FFmpegOption('ss', C.INPUT, new Map([[2545, null]]))).not.to.throw;
  });
  it('does not fail if args is an object', function () {
    const C = FFmpegOption.FFmpegOptionContexts;
    expect(() => new FFmpegOption('ss', C.INPUT, { 2545: null })).not.to.throw;
  });
  it('fails if the args is not a Map or an object', function () {
    const C = FFmpegOption.FFmpegOptionContexts;
    expect(() => new FFmpegOption('ss', C.INPUT, [2545])).to.throw;
  });
});