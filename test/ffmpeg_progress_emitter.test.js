const chai = require('chai'),
  expect = chai.expect,
  fs = require('fs'),
  util = require('util'),
  testHelpers = require('./helpers');

const FFmpegProgressEmitter = require('../lib/ffmpeg_progress_emitter');

const progressChunksJSON = fs.readFileSync(`${__dirname}/fixtures/ffmpeg-video-progress-chunks.json`).toString(),
  progressChunksFixture = JSON.parse(progressChunksJSON);

describe('FFmpegProgressEmitter', function () {
  it('creates an FFmpegProgressEmitter object', function () {
    const progress = new FFmpegProgressEmitter();
    expect(progress).to.be.instanceof(FFmpegProgressEmitter);
  });
  it('emits the update event when video stream progress data is pushed into it', function (done) {
    const progress = new FFmpegProgressEmitter();
    const progressChunk = 'frame= 1781 fps=161 q=28.0 size=    2304kB time=00:01:14.55 bitrate= 253.1kbits/s speed=6.75x';
    progress.on('update', (data) => {
      expect(data).to.be.an('object');
      expect(data).to.have.ownProperty('streamType');
      expect(data.streamType).to.eql('video');
      expect(data).to.have.ownProperty('currentTime');
      expect(data.currentTime).to.eql(74.55);
      expect(data).to.have.ownProperty('frame');
      expect(data.frame).to.eql(1781);
      expect(data).to.have.ownProperty('fps');
      expect(data.fps).to.eql(161);
      expect(data).to.have.ownProperty('q');
      expect(data.q).to.eql(28.0);
      expect(data).to.have.ownProperty('size');
      expect(data.size).to.eql('2304kB');
      expect(data).to.have.ownProperty('bitrate');
      expect(data.bitrate).to.eql('253.1kbits/s');
      expect(data).to.have.ownProperty('speed');
      expect(data.speed).to.eql('6.75x');
      done();
    });
    const testData = testHelpers.createTestReadableStream();
    testData.pipe(progress);
    testData.push(Buffer.from(progressChunk, 'utf8'));
  });
  it('emits the update event when audio stream progress data is pushed into it', function (done) {
    const progress = new FFmpegProgressEmitter();
    const progressChunk = 'frame= 1781 fps=161 q=28.0 size=    2304kB time=00:01:14.55 bitrate= 253.1kbits/s speed=6.75x';
    progress.on('update', (data) => {
      expect(data).to.be.an('object');
      expect(data).to.have.ownProperty('streamType');
      expect(data.streamType).to.eql('video');
      expect(data).to.have.ownProperty('currentTime');
      expect(data.currentTime).to.eql(74.55);
      expect(data).to.have.ownProperty('frame');
      expect(data.frame).to.eql(1781);
      expect(data).to.have.ownProperty('fps');
      expect(data.fps).to.eql(161);
      expect(data).to.have.ownProperty('q');
      expect(data.q).to.eql(28.0);
      expect(data).to.have.ownProperty('size');
      expect(data.size).to.eql('2304kB');
      expect(data).to.have.ownProperty('bitrate');
      expect(data.bitrate).to.eql('253.1kbits/s');
      expect(data).to.have.ownProperty('speed');
      expect(data.speed).to.eql('6.75x');
      done();
    });
    const testData = testHelpers.createTestReadableStream();
    testData.pipe(progress);
    testData.push(Buffer.from(progressChunk, 'utf8'));
  });
  it('provides the last n writes into the stream', function (done) {
    const progress = new FFmpegProgressEmitter();
    const testData = testHelpers.createTestReadableStream();
    testData.on('finish', () => progress.end());
    const expected = progressChunksFixture.slice(progressChunksFixture.length - 10);
    testData.pipe(progress);
    for (let progressChunk of progressChunksFixture) {
      testData.push(Buffer.from(progressChunk, 'utf8'));
    }
    testData.push(null);
    progress.on('finish', () => {
      const lastOne = progress.last();
      const lastTen = progress.last(10);
      expect(lastTen).to.deep.eql(expected);
      expect(lastOne).to.eql('Exiting normally, received signal 15.\n');
      done();
    });
  });
  it('provides the all writes into the stream', function (done) {
    const progress = new FFmpegProgressEmitter();
    const testData = testHelpers.createTestReadableStream();
    testData.on('finish', () => progress.end());
    const expected = progressChunksFixture;
    testData.pipe(progress);
    for (let progressChunk of progressChunksFixture) {
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
