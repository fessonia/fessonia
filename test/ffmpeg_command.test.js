const chai = require('chai'),
  expect = chai.expect;

const FFmpegCommand = require('../lib/ffmpeg_command');

describe('FFmpegCommand', function () {
  it('creates an FFmpegCommand object', function () {
    const fi = new FFmpegCommand();
    expect(fi).to.be.instanceof(FFmpegCommand);
  });
  it('sets the options property on the object', function () {
    expect(new FFmpegCommand().options).to.eql(new Map());
    expect(new FFmpegCommand(new Map()).options).to.eql(new Map());
    expect(new FFmpegCommand({}).options).to.eql(new Map());
  });
});
