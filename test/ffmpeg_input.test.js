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
    expect(new FFmpegInput('/some/file.mov', {}).options).to.eql({});
  });
  it('sets the url property on the object', function () {
    const input_file = '/some/file.mov';
    expect(new FFmpegInput(input_file, {}).url).to.eql(input_file);
  });
  it('generates the correct command array segment', function () {
    const expectedLast = '/some/file.mov';
    const expectedArgs = [
      ['-ss', '5110.77'],
      ['-itsoffset', '0'],
      ['-i', '/some/file.mov']
    ];
    const fiCmd = new FFmpegInput('/some/file.mov', {
      'itsoffset': 0,
      'ss': 5110.77
    }).toCommandArray();
    testHelpers.expectLast(fiCmd, expectedLast);
    testHelpers.expectSequences(fiCmd, expectedArgs);
  });
  it('generates the correct command string segment', function () {
    const expected = '-ss 5110.77 -itsoffset 0 -i /some/file.mov';
    const fi = new FFmpegInput('/some/file.mov', {
      'itsoffset': 0,
      'ss': 5110.77
    });
    expect(fi.toCommandString()).to.eql(expected);
  });
});
