const chai = require('chai'),
  expect = chai.expect;

const FfmpegInput = require('../lib/ffmpeg_input');

describe('FfmpegInput', function () {
  it('creates an FfmpegInput object', function () {
    const fi = new FfmpegInput('/some/file.mov');
    expect(fi).to.be.instanceof(FfmpegInput);
  });
  it('disallows creating FfmpegInput object with no file or url', function () {
    expect(() => new FfmpegInput(null, {})).to.throw();
  });
  it('sets the options property on the object', function () {
    expect(new FfmpegInput('/some/file.mov', {}).options).to.eql({});
  });
  it('sets the url property on the object', function () {
    const input_file = '/some/file.mov';
    expect(new FfmpegInput(input_file, {}).url).to.eql(input_file);
  });
  it('generates the correct command string segment', function () {
    const expected = '-ss 5110.77 -i "/some/file.mov" -itsoffset 0';
    const fi = new FfmpegInput('/some/file.mov', {
      'ss': 5110.77,
      'itsoffset': 0
    });
    expect(fi.toCommandString()).to.eql(expected);
  });
});
