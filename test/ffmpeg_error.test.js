const chai = require('chai'),
  expect = chai.expect,
  sinon = require('sinon'),
  fs = require('fs');

const FFmpegError = require('../lib/ffmpeg_error');

describe('FFmpegError', function () {
  describe('constructor()', function () {
    let originalError;
    beforeEach(() => {
      originalError = new Error('message');
    });

    it('creates an FFmpegError object', () => {
      const error = new FFmpegError(originalError);
      expect(error).to.be.instanceof(FFmpegError);
    });

    it('should set name on error object', () => {
      const error = new FFmpegError(originalError);
      expect(error.name).to.eql('FFmpegError');
    });

    it('creates an FFmpegError object with message last line of input message', () => {
      originalError.message = 'first line\nsecond line\nlast line';
      const error = new FFmpegError(originalError);
      expect(error.message).to.eql('last line');
    });

    it('creates an FFmpegError object last line of input message disregarding whitespace', () => {
      originalError.message = 'first line\nsecond line\nlast line\n';
      const error = new FFmpegError(originalError);
      expect(error.message).to.eql('last line');
    });

    it('creates an FFmpegError object with stderr set to original message', () => {
      originalError.message = 'first line\nsecond line\nlast line';
      const error = new FFmpegError(originalError);
      expect(error.stderr).to.eql(originalError.message);
    });

    it('should copy some properties from the original object', () => {
      originalError.killed = true;
      originalError.signal = 'SIGINT';
      originalError.code = 1;
      originalError.cmd = 'ffmpeg -i';
      const error = new FFmpegError(originalError);
      expect(error.killed).to.eql(originalError.killed);
      expect(error.signal).to.eql(originalError.signal);
      expect(error.code).to.eql(originalError.code);
      expect(error.cmd).to.eql(originalError.cmd);
    });

    it('should not copy other properties from the original object', () => {
      originalError.sassafras = 'zeugma';
      const error = new FFmpegError(originalError);
      expect(error.sassafras).to.be.undefined;
    });
  });
});
