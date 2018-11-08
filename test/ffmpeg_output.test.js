const chai = require('chai'),
  expect = chai.expect;

const FfmpegOutput = require('../lib/ffmpeg_output');

describe('FfmpegOutput', function () {
  it('creates an FfmpegOutput object', function () {
    const fi = new FfmpegOutput({ file: '/some/file.mov' });
    expect(fi).to.be.instanceof(FfmpegOutput);
  });
  it('disallows creating FfmpegOutput object with no file or url', function () {
    expect(() => new FfmpegOutput({})).to.throw();
  });
  it('sets the options property on the object', function () {
    const opts = { file: '/some/file.mov' };
    expect(new FfmpegOutput(opts).options).to.eql(opts);
  });
  it('sets the url property on the object', function () {
    const output_file = '/some/file.mov';
    expect(new FfmpegOutput({ url: output_file }).url).to.eql(output_file);
    expect(new FfmpegOutput({ file: output_file }).url).to.eql(output_file);
  });
});
