const chai = require('chai'),
  expect = chai.expect,
  testHelpers = require('./helpers');

const FFmpegCommand = require('../lib/ffmpeg_command');
const FFmpegInput = require('../lib/ffmpeg_input');
const FFmpegOutput = require('../lib/ffmpeg_output');
const config = require('../lib/util/config')();

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
    const expected = new Map([
      [
        'input_tag',
        new Map([
          [0, { output_tag: 3 }]
        ])
      ]
    ]);
    const result = fc.mappedIO();
    expect(result.size).to.eql(expected.size);
    for (let [fromKey, fromVal] of result) {
      for (let [fromIndex, toVal] of fromVal) {
        expect(toVal).to.deep.eql(expected.get(fromKey).get(fromIndex));
      }
    }
  });
  it.skip('it warns when overwriting a mapping', function () {
    const fc = new FFmpegCommand();
    fc.mapIO('input_tag', 0, 'output_tag', 2);
    expect(() => fc.mapIO('input_tag', 0, 'output_tag', 3)).to.warn;
    const expected = new Map([['input_tag', new Map([[0, { output_tag: 3 }]])]]);
    const result = fc.mappedIO();
    expect(result.size).to.eql(expected.size);
    for (let [fromKey, fromVal] of result) {
      for (let [fromIndex, toVal] of fromVal) {
        expect(toVal).to.deep.eql(expected.get(fromKey).get(fromIndex));
      }
    }
  });
  it('generates the correct command object', function () {
    const fc = new FFmpegCommand(new Map([['y'],]));
    const fi = new FFmpegInput('/some/file.mov', new Map([
      ['threads', '8'],
      ['itsoffset', '0'],
      ['ss', '6234.0182917']
    ]));
    const fo = new FFmpegOutput('/dev/null', new Map([
      ['c:v', 'libx264'],
      ['preset:v', 'slow'],
      ['profile:v', 'high'],
      ['pix_fmt', 'yuv420p'],
      ['coder', '1'],
      ['g', '48'],
      ['b:v', '3850k'],
      ['flags', '+bitexact'],
      ['sws_flags', '+accurate_rnd+bitexact'],
      ['fflags', '+bitexact'],
      ['maxrate', '4000k'],
      ['bufsize', '2850k'],
      ['an'],
      ['f', 'mp4'],
      ['aspect', '16:9'],
      ['pass', '1'],
    ]));
    fc.addInput(fi);
    fc.addOutput(fo);
    const fcCmd = fc.toCommand();
    const expected = {
      command: config.ffmpeg_bin,
      seqs: [
        fi.toCommandArray(),
        fo.toCommandArray(),
        fi.toCommandArray().concat(fo.toCommandArray()),
        [
          '-y',
          '-threads', '8',
          '-itsoffset', '0',
          '-ss', '6234.0182917',
          '-i', '/some/file.mov',
          '-c:v', 'libx264',
          '-preset:v', 'slow',
          '-profile:v', 'high',
          '-pix_fmt', 'yuv420p',
          '-coder', '1',
          '-g', '48',
          '-b:v', '3850k',
          '-flags', '+bitexact',
          '-sws_flags', '+accurate_rnd+bitexact',
          '-fflags', '+bitexact',
          '-maxrate', '4000k',
          '-bufsize', '2850k',
          '-an',
          '-f', 'mp4',
          '-aspect', '16:9',
          '-pass', '1',
          '/dev/null',
        ]
      ]
    };
    expect(fcCmd.command).to.eql(expected.command);
    testHelpers.expectSequences(fcCmd.args, expected.seqs);
  });
  it('generates the correct command string', function () {
    const fc = new FFmpegCommand(new Map([['y'],]));
    const fi = new FFmpegInput('/some/file.mov', new Map([
      ['threads', '8'],
      ['itsoffset', '0'],
      ['ss', '6234.0182917']
    ]));
    const fo = new FFmpegOutput('/dev/null', new Map([
      ['c:v', 'libx264'],
      ['preset:v', 'slow'],
      ['profile:v', 'high'],
      ['pix_fmt', 'yuv420p'],
      ['coder', '1'],
      ['g', '48'],
      ['b:v', '3850k'],
      ['flags', '+bitexact'],
      ['sws_flags', '+accurate_rnd+bitexact'],
      ['fflags', '+bitexact'],
      ['maxrate', '4000k'],
      ['bufsize', '2850k'],
      ['an'],
      ['f', 'mp4'],
      ['aspect', '16:9'],
      ['pass', '1'],
    ]));
    fc.addInput(fi);
    fc.addOutput(fo);
    const expected = `${config.ffmpeg_bin} -y -threads "8" -itsoffset "0" -ss "6234.0182917" -i "/some/file.mov" -c:v "libx264" -preset:v "slow" -profile:v "high" -pix_fmt "yuv420p" -coder "1" -g "48" -b:v "3850k" -flags "+bitexact" -sws_flags "+accurate_rnd+bitexact" -fflags "+bitexact" -maxrate "4000k" -bufsize "2850k" -an -f "mp4" -aspect "16:9" -pass "1" "/dev/null"`;
    expect(fc.toString()).to.eql(expected);
  });
});
