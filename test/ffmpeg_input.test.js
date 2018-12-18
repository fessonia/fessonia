const chai = require('chai'),
  expect = chai.expect,
  testHelpers = require('./helpers');

const FFmpegInput = require('../lib/ffmpeg_input');

describe('FFmpegInput', function () {
  it('creates an FFmpegInput object', function () {
    const fi = new FFmpegInput('/some/file.mov');
    expect(fi).to.be.instanceof(FFmpegInput);
  });
  it('disallows creating FFmpegInput object with no file or url', function () {
    expect(() => new FFmpegInput(null, {})).to.throw();
  });
  it('sets the options property on the object', function () {
    expect(new FFmpegInput('/some/file.mov', new Map()).options).to.eql(new Map());
    expect(new FFmpegInput('/some/file.mov', {}).options).to.eql(new Map());
  });
  it('sets the url property on the object', function () {
    const input_file = '/some/file.mov';
    expect(new FFmpegInput(input_file, {}).url).to.eql(input_file);
  });
  it('handles filenames with quotes properly', function () {
    const fi = new FFmpegInput('/some/file with "quotes".mp4', {});
    const expectedCommandArray = ['-i', '/some/file with "quotes".mp4'];
    const expectedCommandString = '-i "/some/file with \\"quotes\\".mp4"';
    expect(fi.url).to.eql('/some/file with "quotes".mp4');
    expect(fi.toCommandArray()).to.deep.eql(expectedCommandArray);
    expect(fi.toCommandString()).to.eql(expectedCommandString);
  });
  it('generates the correct command array segment', function () {
    const expectedLast = '/some/file.mov';
    const expectedArgs = [
      ['-bitexact'],
      ['-ss', '5110.77'],
      ['-itsoffset', '0'],
      ['-i', '/some/file.mov']
    ];
    const fiCmdObj = new FFmpegInput('/some/file.mov', {
      'bitexact': undefined,
      'itsoffset': 0,
      'ss': 5110.77
    }).toCommandArray();
    testHelpers.expectLast(fiCmdObj, expectedLast);
    testHelpers.expectSequences(fiCmdObj, expectedArgs);
    const fiCmdMap = new FFmpegInput('/some/file.mov', new Map([
      ['bitexact'],
      ['itsoffset', 0],
      ['ss', 5110.77]
    ])).toCommandArray();
    testHelpers.expectLast(fiCmdMap, expectedLast);
    testHelpers.expectSequences(fiCmdMap, expectedArgs);
  });
  it('generates the correct command string segment', function () {
    const expected = '-ss "5110.77" -itsoffset "0" -bitexact -i "/some/file.mov"';
    const fiObj = new FFmpegInput('/some/file.mov', {
      'bitexact': null,
      'itsoffset': 0,
      'ss': 5110.77
    });
    expect(fiObj.toCommandString()).to.eql(expected);
    const fiMap = new FFmpegInput('/some/file.mov', new Map([
      ['bitexact', null],
      ['itsoffset', 0],
      ['ss', 5110.77]
    ]));
    expect(fiMap.toCommandString()).to.eql(expected);
  });
});
