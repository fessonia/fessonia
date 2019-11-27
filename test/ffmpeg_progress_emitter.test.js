const chai = require('chai'),
  expect = chai.expect,
  sinon = require('sinon'),
  testHelpers = require('./helpers');

const FFmpegProgressEmitter = require('../lib/ffmpeg_progress_emitter');

const videoProgressChunksFixture = require('./fixtures/ffmpeg-video-progress-chunks.js'),
  videoProgressBufferFixture = require('./fixtures/ffmpeg-video-progress-progressBuffer'),
  videoLogBufferFixture = require('./fixtures/ffmpeg-video-progress-logBuffer');
const audioProgressChunksFixture = require('./fixtures/ffmpeg-audio-progress-chunks.js'),
  audioProgressBufferFixture = require('./fixtures/ffmpeg-audio-progress-progressBuffer'),
  audioLogBufferFixture = require('./fixtures/ffmpeg-audio-progress-logBuffer');
const interspersedProgressChunksFixture = require('./fixtures/ffmpeg-interspersed-progress-chunks.js'),
  interspersedProgressBufferFixture = require('./fixtures/ffmpeg-interspersed-progress-progressBuffer'),
  interspersedLogBufferFixture = require('./fixtures/ffmpeg-interspersed-progress-logBuffer');

describe('FFmpegProgressEmitter', function () {
  it('creates an FFmpegProgressEmitter object', function () {
    const progress = new FFmpegProgressEmitter();
    expect(progress).to.be.instanceof(FFmpegProgressEmitter);
  });
  describe('video output handling', () => {
    it('emits the update event when video stream progress data is pushed into it', function (done) {
      const progress = new FFmpegProgressEmitter();
      const progressChunks = [
        'frame=1258\n', 'fps=75.01\n', 'stream_0_1_q=40.0\n',
        'bitrate= 234.9kbits/s\n', 'total_size=1572912\n',
        'out_time_us=53568000\n', 'out_time_ms=53568000\n',
        'out_time=00:00:53.568000\n', 'dup_frames=0\n', 'drop_frames=0\n',
        'speed=3.19x\n', 'progress=continue\n'
      ];
      progress.on('update', (data) => {
        expect(data).to.be.an('object');
        expect(data).to.have.ownProperty('frame');
        expect(data.frame).to.eql(1258);
        expect(data).to.have.ownProperty('fps');
        expect(data.fps).to.eql(75.01);
        expect(data).to.have.ownProperty('stream_0_1_q');
        expect(data.stream_0_1_q).to.eql(40.0);
        expect(data).to.have.ownProperty('bitrate');
        expect(data.bitrate).to.eql('234.9kbits/s');
        expect(data).to.have.ownProperty('total_size');
        expect(data.total_size).to.eql(1572912);
        expect(data).to.have.ownProperty('out_time_us');
        expect(data.out_time_us).to.eql(53568000);
        expect(data).to.have.ownProperty('out_time_ms');
        expect(data.out_time_ms).to.eql(53568000);
        expect(data).to.have.ownProperty('out_time');
        expect(data.out_time).to.eql('00:00:53.568000')
        expect(data).to.have.ownProperty('dup_frames');
        expect(data.dup_frames).to.eql(0);
        expect(data).to.have.ownProperty('drop_frames');
        expect(data.drop_frames).to.eql(0);
        expect(data).to.have.ownProperty('speed');
        expect(data.speed).to.eql('3.19x');
        done();
      });
      const testData = testHelpers.createTestReadableStream();
      testData.pipe(progress);
      for (let chunk of progressChunks) {
        testData.push(Buffer.from(chunk, 'utf8'));
      }
    });
    it('provides the last n log data writes into the stream', function (done) {
      const progress = new FFmpegProgressEmitter();
      const testData = testHelpers.createTestReadableStream();
      testData.on('finish', () => progress.end());
      const expected = videoLogBufferFixture
        .slice(videoLogBufferFixture.length - 10);
      testData.pipe(progress);
      for (let progressChunk of videoProgressChunksFixture) {
        testData.push(Buffer.from(progressChunk, 'utf8'));
      }
      testData.push(null);
      progress.on('finish', () => {
        const lastOne = progress.last();
        const lastTen = progress.last(10);
        expect(lastTen).to.deep.eql(expected);
        expect(lastOne).to.eql(expected.slice(expected.length - 1));
        done();
      });
    });
    it('provides all log data writes into the stream', function (done) {
      const progress = new FFmpegProgressEmitter();
      const testData = testHelpers.createTestReadableStream();
      testData.on('finish', () => progress.end());
      const expected = videoLogBufferFixture;
      testData.pipe(progress);
      for (let progressChunk of videoProgressChunksFixture) {
        testData.push(Buffer.from(progressChunk, 'utf8'));
      }
      testData.push(null);
      progress.on('finish', () => {
        const buffered = progress.logData();
        expect(buffered).to.deep.eql(expected);
        done();
      });
    });
  });
  describe('audio output handling', () => {
    it('emits the update event when audio stream progress data is pushed into it', function (done) {
      const progress = new FFmpegProgressEmitter();
      const progressChunks = [
        'bitrate=  44.5kbits/s\n', 'total_size=1835052\n',
        'out_time_us=330048000\n', 'out_time_ms=330048000\n',
        'out_time=00:05:30.048000\n', 'dup_frames=0\n',
        'drop_frames=0\n', 'speed= 132x\n', 'progress=continue\n'
      ];
      progress.on('update', (data) => {
        expect(data).to.be.an('object');
        expect(data).to.have.ownProperty('out_time');
        expect(data.out_time).to.eql('00:05:30.048000');
        expect(data).to.have.ownProperty('total_size');
        expect(data.total_size).to.eql(1835052);
        expect(data).to.have.ownProperty('bitrate');
        expect(data.bitrate).to.eql('44.5kbits/s');
        expect(data).to.have.ownProperty('speed');
        expect(data.speed).to.eql('132x');
        expect(data).to.have.ownProperty('dup_frames');
        expect(data.dup_frames).to.eql(0);
        expect(data).to.have.ownProperty('drop_frames');
        expect(data.drop_frames).to.eql(0);
        expect(data).to.have.ownProperty('out_time_ms');
        expect(data.out_time_ms).to.eql(330048000);
        expect(data).to.have.ownProperty('out_time_us');
        expect(data.out_time_us).to.eql(330048000);
        done();
      });
      const testData = testHelpers.createTestReadableStream();
      testData.pipe(progress);
      for (let chunk of progressChunks) {
        testData.push(Buffer.from(chunk, 'utf8'));
      }
    });
    it('provides the last n log data writes into the stream', function (done) {
      const progress = new FFmpegProgressEmitter();
      const testData = testHelpers.createTestReadableStream();
      testData.on('finish', () => progress.end());
      const expected = audioLogBufferFixture
        .slice(audioLogBufferFixture.length - 10);
      testData.pipe(progress);
      for (let progressChunk of audioProgressChunksFixture) {
        testData.push(Buffer.from(progressChunk, 'utf8'));
      }
      testData.push(null);
      progress.on('finish', () => {
        const lastOne = progress.last();
        const lastTen = progress.last(10);
        expect(lastTen).to.deep.eql(expected);
        expect(lastOne).to.eql(expected.slice(expected.length - 1));
        done();
      });
    });
    it('provides all log data writes into the stream', function (done) {
      const progress = new FFmpegProgressEmitter();
      const testData = testHelpers.createTestReadableStream();
      testData.on('finish', () => progress.end());
      const expected = audioLogBufferFixture;
      testData.pipe(progress);
      for (let progressChunk of audioProgressChunksFixture) {
        testData.push(Buffer.from(progressChunk, 'utf8'));
      }
      testData.push(null);
      progress.on('finish', () => {
        const buffered = progress.logData();
        expect(buffered).to.deep.eql(expected);
        done();
      });
    });
  });
  describe('interspersed output handling', () => {
    it('provides the last n log data writes into the stream', function (done) {
      const progress = new FFmpegProgressEmitter();
      const testData = testHelpers.createTestReadableStream();
      testData.on('finish', () => progress.end());
      const expected = interspersedLogBufferFixture
        .slice(interspersedLogBufferFixture.length - 10);
      testData.pipe(progress);
      for (let progressChunk of interspersedProgressChunksFixture) {
        testData.push(Buffer.from(progressChunk, 'utf8'));
      }
      testData.push(null);
      progress.on('finish', () => {
        const lastOne = progress.last();
        const lastTen = progress.last(10);
        expect(lastTen).to.deep.eql(expected);
        expect(lastOne).to.eql(expected.slice(expected.length - 1));
        done();
      });
    });
    it('provides all log data writes into the stream', function (done) {
      const progress = new FFmpegProgressEmitter();
      const testData = testHelpers.createTestReadableStream();
      testData.on('finish', () => progress.end());
      const expected = interspersedLogBufferFixture;
      testData.pipe(progress);
      for (let progressChunk of interspersedProgressChunksFixture) {
        testData.push(Buffer.from(progressChunk, 'utf8'));
      }
      testData.push(null);
      progress.on('finish', () => {
        const buffered = progress.logData();
        expect(buffered).to.deep.eql(expected);
        done();
      });
    });
  });
  describe('parsing internals', () => {
    let progress;
    beforeEach(() => {
      progress = new FFmpegProgressEmitter();
    });
    describe('#_write', () => {
      it('should add to logBuffer if not a progress string', () => {
        const testChunk = 'this is not= a progress chunk\n';
        progress.write(testChunk);
        expect(progress.logBuffer).to.include(testChunk);
      });

      it('should call _parseProgress if a progress string', () => {
        const mock = sinon.mock(progress);
        const testChunk = 'thisis= a progress string\n';
        mock.expects('_parseProgress').once().withArgs(testChunk.trim());
        progress.write(testChunk);
        mock.verify();
      });

      it('should drop lines ending in \\r', () => {
        const testChunk = 'this should not appear in the log\r';
        progress.write(testChunk);
        expect(progress.logBuffer).to.not.include(testChunk);
      });
    });
    describe('#_parseProgress', () => {
      it('parses key value pairs from a string', () => {
        const testChunk = 'abc=def\n';
        const expected = 'def';
        progress._parseProgress(testChunk);
        expect(progress.partialProgressData.abc).to.eql(expected);
      });
      it('parses key value pairs with space between = and value', () => {
        const testChunk = 'abc=   def\n';
        const expected = 'def';
        progress._parseProgress(testChunk);
        expect(progress.partialProgressData.abc).to.eql(expected);
      });
      it('converts number values into numbers', () => {
        const testChunk = 'abc=   14.25';
        const expected = 14.25;
        progress._parseProgress(testChunk);
        expect(progress.partialProgressData.abc).to.eql(expected);
      });
      it('calls _emitUpdateEvent if progress key provided', () => {
        const mock = sinon.mock(progress);
        mock.expects('_emitUpdateEvent').once().withArgs();
        progress.partialProgressData = {
          zeugma: 'hendiadys',
          litotes: 'chiasmus'
        };
        progress._parseProgress('progress=continue\n');
        mock.verify();
      });
    });

    describe('_emitUpdateEvent', () => {
      it('should set progressData to partialProgressData', () => {
        const progressData = {
          zeugma: 'hendiadys',
          chiasmus: 'litotes'
        };
        progress.partialProgressData = progressData;
        progress.progressData = {
          hello: 'there'
        };
        progress._emitUpdateEvent();
        expect(progress.progressData).to.eql(progressData);
      });

      it('should reset partialProgressData', () => {
        const progressData = {
          zeugma: 'hendiadys',
          chiasmus: 'litotes'
        };
        progress.partialProgressData = progressData;
        progress._emitUpdateEvent();
        expect(progress.partialProgressData).to.eql({});
      });
    });
  });
});
