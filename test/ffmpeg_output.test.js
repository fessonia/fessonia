const chai = require('chai'),
  expect = chai.expect,
  testHelpers = require('./helpers');

const FFmpegOutput = require('../lib/ffmpeg_output');

describe('FFmpegOutput', function () {
  it('creates an FFmpegOutput object', function () {
    const fi = new FFmpegOutput('/some/file.mp4', {});
    expect(fi).to.be.instanceof(FFmpegOutput);
  });
  it('sets the options property on the object', function () {
    expect(new FFmpegOutput('/some/file.mp4', {}).options).to.eql(new Map());
  });
  it('sets the url property on the object', function () {
    expect(new FFmpegOutput('/some/file.mp4', {}).url).to.eql('/some/file.mp4');
  });
  it('handles filenames with quotes properly', function () {
    const fo = new FFmpegOutput('/some/file with "quotes".mp4', {});
    const expectedCommandArray = ['/some/file with "quotes".mp4'];
    const expectedCommandString = '"/some/file with \\"quotes\\".mp4"';
    expect(fo.url).to.eql('/some/file with "quotes".mp4');
    expect(fo.toCommandArray()).to.deep.eql(expectedCommandArray);
    expect(fo.toCommandString()).to.eql(expectedCommandString);
  });
  it('generates the correct command array segment', function () {
    const expectedLast = '/some/file.mp4';
    const expectedArgs = [
      ['-dn'],
      ['-b:v', '3850k'],
      ['-f', 'mp4'],
      ['-aspect', '16:9']
    ];
    const foCmdObj = new FFmpegOutput('/some/file.mp4', {
      'dn': undefined,
      'aspect': '16:9',
      'f': 'mp4',
      'b:v': '3850k'
    }).toCommandArray();
    testHelpers.expectLast(foCmdObj, expectedLast);
    testHelpers.expectSequences(foCmdObj, expectedArgs);
    const foCmdMap = new FFmpegOutput('/some/file.mp4', new Map([
      ['dn'],
      ['b:v', '3850k'],
      ['f', 'mp4'],
      ['aspect', '16:9']
    ])).toCommandArray();
    testHelpers.expectLast(foCmdMap, expectedLast);
    testHelpers.expectSequences(foCmdMap, expectedArgs);
  });
  it('generates the correct command string segment', function () {
    const expected = '-b:v "3850k" -f "mp4" -aspect "16:9" -dn "/some/file.mp4"';
    const foObj = new FFmpegOutput('/some/file.mp4', {
      'dn': null,
      'aspect': '16:9',
      'f': 'mp4',
      'b:v': '3850k'
    });
    expect(foObj.toCommandString()).to.eql(expected);
    const foMap = new FFmpegOutput('/some/file.mp4', new Map([
      ['dn', null],
      ['aspect', '16:9'],
      ['f', 'mp4'],
      ['b:v', '3850k']
    ]));
    expect(foMap.toCommandString()).to.eql(expected);
  });
});
