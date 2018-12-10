const chai = require('chai'),
  expect = chai.expect,
  testHelpers = require('./helpers');

const FfmpegOutput = require('../lib/ffmpeg_output');

describe('FfmpegOutput', function () {
  it('creates an FfmpegOutput object', function () {
    const fi = new FfmpegOutput('/some/file.mp4', {});
    expect(fi).to.be.instanceof(FfmpegOutput);
  });
  it('sets the options property on the object', function () {
    expect(new FfmpegOutput('/some/file.mp4', {}).options).to.eql(new Map());
  });
  it('sets the url property on the object', function () {
    expect(new FfmpegOutput('/some/file.mp4', {}).url).to.eql('/some/file.mp4');
  });
  it('generates the correct command array segment', function () {
    const expectedLast = '/some/file.mp4';
    const expectedArgs = [
      ['-b:v', '3850k'],
      ['-f', 'mp4'],
      ['-aspect', '16:9']
    ];
    const foCmdObj = new FfmpegOutput('/some/file.mp4', {
      'aspect': '16:9',
      'f': 'mp4',
      'b:v': '3850k'
    }).toCommandArray();
    testHelpers.expectLast(foCmdObj, expectedLast);
    testHelpers.expectSequences(foCmdObj, expectedArgs);
    const foCmdMap = new FfmpegOutput('/some/file.mp4', new Map([
      ['b:v', '3850k'],
      ['f', 'mp4'],
      ['aspect', '16:9']
    ])).toCommandArray();
    testHelpers.expectLast(foCmdMap, expectedLast);
    testHelpers.expectSequences(foCmdMap, expectedArgs);
  });
  it('generates the correct command string segment', function () {
    const expected = '-b:v "3850k" -f "mp4" -aspect "16:9" "/some/file.mp4"';
    const foObj = new FfmpegOutput('/some/file.mp4', {
      'aspect': '16:9',
      'f': 'mp4',
      'b:v': '3850k'
    });
    expect(foObj.toCommandString()).to.eql(expected);
    const foMap = new FfmpegOutput('/some/file.mp4', new Map([
      ['aspect', '16:9'],
      ['f', 'mp4'],
      ['b:v', '3850k']
    ]));
    expect(foMap.toCommandString()).to.eql(expected);
  });
});
