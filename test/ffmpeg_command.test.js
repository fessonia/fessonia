const chai = require('chai'),
  expect = chai.expect;

const FFmpegCommand = require('../lib/ffmpeg_command');
const FFmpegInput = require('../lib/ffmpeg_input');
const FFmpegOutput = require('../lib/ffmpeg_output');

describe('FFmpegCommand', function () {
  it('creates an FFmpegCommand object', function () {
    const fc = new FFmpegCommand();
    expect(fc).to.be.instanceof(FFmpegCommand);
  });
  it('sets the options property on the object', function () {
    expect(new FFmpegCommand().options).to.eql(new Map());
    expect(new FFmpegCommand(new Map()).options).to.eql(new Map());
    expect(new FFmpegCommand({}).options).to.eql(new Map());
  });
  it('allows adding inputs on and retrieving inputs from the object', function () {
    const fc = new FFmpegCommand();
    const fi = new FFmpegInput('/some/file.mov', {});
    fc.addInput(fi);
    expect(fc.inputs()).to.contain(fi);
  });
  it('allows adding outputs on and retrieving outputs from the object', function () {
    const fc = new FFmpegCommand();
    const fo = new FFmpegOutput('/some/file.mov', {});
    fc.addOutput(fo);
    expect(fc.outputs()).to.contain(fo);
  });
  it('it allows mapping inputs to outputs', function () {
    const fc = new FFmpegCommand();
    const result = fc.mapIO('input_tag', 0, 'output_tag', 3);
    expect(result).to.be.true;
  });
  it('it allows getting mapped inputs and outputs', function () {
    const fc = new FFmpegCommand();
    fc.mapIO('input_tag', 0, 'output_tag', 3);
    const expected = new Map([['input_tag', new Map([[0, { output_tag: 3 }]])]]);
    const result = fc.mappedIO();
    expect(result.size).to.eql(expected.size);
    for (let [fromKey, fromVal] of result) {
      for (let [fromIndex, toVal] of fromVal) {
        expect(toVal).to.deep.eql(expected.get(fromKey).get(fromIndex));
      }
    }
  });
});
