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
      const progressChunk = 'frame=1258\nfps=75.01\nstream_0_1_q=40.0\nbitrate= 234.9kbits/s\ntotal_size=1572912\nout_time_us=53568000\nout_time_ms=53568000\nout_time=00:00:53.568000\ndup_frames=0\ndrop_frames=0\nspeed=3.19x\nprogress=continue\n';
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
      testData.push(Buffer.from(progressChunk, 'utf8'));
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
    it('provides the last n progress data writes into the stream', function (done) {
      const progress = new FFmpegProgressEmitter();
      const testData = testHelpers.createTestReadableStream();
      testData.on('finish', () => progress.end());
      const expected = videoProgressBufferFixture
        .slice(videoProgressBufferFixture.length - 10);
      testData.pipe(progress);
      for (let progressChunk of videoProgressChunksFixture) {
        testData.push(Buffer.from(progressChunk, 'utf8'));
      }
      testData.push(null);
      progress.on('finish', () => {
        const lastOne = progress.lastProgressChunks();
        const lastTen = progress.lastProgressChunks(10);
        expect(lastTen).to.almost.eql(expected);
        expect(lastOne).to.almost.eql(expected.slice(expected.length - 1));
        done();
      });
    });
    it('provides all progress data writes into the stream', function (done) {
      const progress = new FFmpegProgressEmitter();
      const testData = testHelpers.createTestReadableStream();
      testData.on('finish', () => progress.end());
      const expected = videoProgressBufferFixture;
      testData.pipe(progress);
      for (let progressChunk of videoProgressChunksFixture) {
        testData.push(Buffer.from(progressChunk, 'utf8'));
      }
      testData.push(null);
      progress.on('finish', () => {
        const buffered = progress.progressChunks();
        expect(buffered).to.almost.eql(expected);
        done();
      });
    });
  });
  describe('audio output handling', () => {
    it('emits the update event when audio stream progress data is pushed into it', function (done) {
      const progress = new FFmpegProgressEmitter();
      const progressChunk = 'size=    2560kB time=00:07:53.79 bitrate=  44.3kbits/s speed= 135x    \r';
      progress.on('update', (data) => {
        expect(data).to.be.an('object');
        expect(data).to.have.ownProperty('time');
        expect(data.time).to.eql(7 * 60 + 53.79);
        expect(data).to.have.ownProperty('size');
        expect(data.size).to.eql('2560kB');
        expect(data).to.have.ownProperty('bitrate');
        expect(data.bitrate).to.eql('44.3kbits/s');
        expect(data).to.have.ownProperty('speed');
        expect(data.speed).to.eql('135x');
        done();
      });
      const testData = testHelpers.createTestReadableStream();
      testData.pipe(progress);
      testData.push(Buffer.from(progressChunk, 'utf8'));
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
    it('provides the last n progress data writes into the stream', function (done) {
      const progress = new FFmpegProgressEmitter();
      const testData = testHelpers.createTestReadableStream();
      testData.on('finish', () => progress.end());
      const expected = audioProgressBufferFixture
        .slice(audioProgressBufferFixture.length - 10);
      testData.pipe(progress);
      for (let progressChunk of audioProgressChunksFixture) {
        testData.push(Buffer.from(progressChunk, 'utf8'));
      }
      testData.push(null);
      progress.on('finish', () => {
        const lastOne = progress.lastProgressChunks();
        const lastTen = progress.lastProgressChunks(10);
        expect(lastTen).to.almost.eql(expected);
        expect(lastOne).to.almost.eql(expected.slice(expected.length - 1));
        done();
      });
    });
    it('provides all progress data writes into the stream', function (done) {
      const progress = new FFmpegProgressEmitter();
      const testData = testHelpers.createTestReadableStream();
      testData.on('finish', () => progress.end());
      const expected = audioProgressBufferFixture;
      testData.pipe(progress);
      for (let progressChunk of audioProgressChunksFixture) {
        testData.push(Buffer.from(progressChunk, 'utf8'));
      }
      testData.push(null);
      progress.on('finish', () => {
        const buffered = progress.progressChunks();
        expect(buffered).to.almost.eql(expected);
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
    it('provides the last n progress data writes into the stream', function (done) {
      const progress = new FFmpegProgressEmitter();
      const testData = testHelpers.createTestReadableStream();
      testData.on('finish', () => progress.end());
      const expected = interspersedProgressBufferFixture
        .slice(interspersedProgressBufferFixture.length - 10);
      testData.pipe(progress);
      for (let progressChunk of interspersedProgressChunksFixture) {
        testData.push(Buffer.from(progressChunk, 'utf8'));
      }
      testData.push(null);
      progress.on('finish', () => {
        const lastOne = progress.lastProgressChunks();
        const lastTen = progress.lastProgressChunks(10);
        expect(lastTen).to.almost.eql(expected);
        expect(lastOne).to.almost.eql(expected.slice(expected.length - 1));
        done();
      });
    });
    it('provides all progress data writes into the stream', function (done) {
      const progress = new FFmpegProgressEmitter();
      const testData = testHelpers.createTestReadableStream();
      testData.on('finish', () => progress.end());
      const expected = interspersedProgressBufferFixture;
      testData.pipe(progress);
      for (let progressChunk of interspersedProgressChunksFixture) {
        testData.push(Buffer.from(progressChunk, 'utf8'));
      }
      testData.push(null);
      progress.on('finish', () => {
        const buffered = progress.progressChunks();
        expect(buffered).to.almost.eql(expected);
        done();
      });
    });
  });
  describe('parsing internals', () => {
    let progress;
    beforeEach(() => {
      progress = new FFmpegProgressEmitter();
    });
    describe('#_needsMoreProcessing', () => {
      it('returns true for strings with a carriage return', () => {
        const testChunk = 'frame= 1781 fps=161 q=28.0 size=    2304kB time=00:01:14.55 bitrate= 253.1kbits/s speed=6.75x   \rframe= 1781 fps=161 ';
        expect(progress._needsMoreProcessing(testChunk)).to.eql(true);
      });
      it('returns true for strings with a newline', () => {
        const testChunk = 'handler_name    : Apple Sound Media Handler\nStream mapping:\n  Stream #0:1 -> #0:0 ';
        expect(progress._needsMoreProcessing(testChunk)).to.eql(true);
      });
      it('returns false for empty strings', () => {
        expect(progress._needsMoreProcessing('')).to.eql(false);
      });
      it('returns false for strings with no newline or carriage return', () => {
        const testChunk = '    Stream #0:0(und): Video: h264 (Constrained Baseline) (avc1 / 0x31637661), yuv420p, 640x480 [SAR 1:1 DAR 4:3], 346 kb/s, 29.97 fps, 29.97 tbr, 11988 tbn, 59.94 tbc (default)';
        expect(progress._needsMoreProcessing(testChunk)).to.eql(false);
      });
    });
    describe('#_nextProcessablePiece', () => {
      it('returns an valid index into the string', () => {
        const testChunk = 'frame= 1781 fps=161 q=28.0 size=    2304kB time=00:01:14.55 bitrate= 253.1kbits/s speed=6.75x   \rframe= 1781 fps=161 ';
        const result = progress._nextProcessablePiece(testChunk);
        expect(result).to.be.a('number');
        expect(result).to.be.lessThan(testChunk.length);
        expect(result).to.be.greaterThan(-1);
      });
      it('returns the index to a newline if a newline is next', () => {
        let testChunk = 'abcdefghi\njklmnopqr\rstuvwxyz';
        let result = progress._nextProcessablePiece(testChunk);
        expect(testChunk[result]).to.eql('\n');
        testChunk = 'abcdefghi\njklmnopqrstuvwxyz';
        result = progress._nextProcessablePiece(testChunk);
        expect(testChunk[result]).to.eql('\n');
      });
      it('returns the index to a CR if a is CR next', () => {
        let testChunk = 'abcdefghi\rjklmnopqr\nstuvwxyz';
        let result = progress._nextProcessablePiece(testChunk);
        expect(testChunk[result]).to.eql('\r');
        testChunk = 'abcdefghi\rjklmnopqrstuvwxyz';
        result = progress._nextProcessablePiece(testChunk);
        expect(testChunk[result]).to.eql('\r');
      });
    });
    describe('#_processProgress', () => {
      it('calls _parseProgress', () => {
        const testChunk = 'frame=538\nfps=75.44\nstream_0_0_q=27.0\nbitrate= 406.3kbits/s\ntotal_size=1048624\nout_time_us=20645667\nout_time_ms=20645667\nout_time=00:00:20.645667\ndup_frames=0\ndrop_frames=0\nspeed= 2.9x\nprogress=continue\n';
        const stub = sinon.stub(progress, '_parseProgress');
        sinon.stub(progress, '_emitUpdateEvent');
        progress._processProgress(testChunk);
        expect(stub.calledOnceWithExactly(testChunk)).to.eql(true);
      });
      it('calls _emitUpdateEvent', () => {
        const testChunk = 'frame=538\nfps=75.44\nstream_0_0_q=27.0\nbitrate= 406.3kbits/s\ntotal_size=1048624\nout_time_us=20645667\nout_time_ms=20645667\nout_time=00:00:20.645667\ndup_frames=0\ndrop_frames=0\nspeed= 2.9x\nprogress=continue\n';
        const parsed = {
          frame: 538,
          fps: 75.44,
          stream_0_0_q: 27,
          bitrate: '406.3kbits/s',
          total_size: 1048624,
          out_time_us: 20645667,
          out_time_ms: 20645667,
          out_time: '00:00:20.645667',
          dup_frames: 0,
          drop_frames: 0,
          speed: '2.9x'
        };
        sinon.stub(progress, '_parseProgress').returns(parsed);
        const stub = sinon.stub(progress, '_emitUpdateEvent');
        progress._processProgress(testChunk);
        expect(stub.calledOnceWithExactly(parsed)).to.eql(true);
      });
      it('adds parsed progress data to the progress buffer', () => {
        const testChunk = 'frame=538\nfps=75.44\nstream_0_0_q=27.0\nbitrate= 406.3kbits/s\ntotal_size=1048624\nout_time_us=20645667\nout_time_ms=20645667\nout_time=00:00:20.645667\ndup_frames=0\ndrop_frames=0\nspeed= 2.9x\nprogress=continue\n';
        const parsed = {
          frame: 538,
          fps: 75.44,
          stream_0_0_q: 27,
          bitrate: '406.3kbits/s',
          total_size: 1048624,
          out_time_us: 20645667,
          out_time_ms: 20645667,
          out_time: '00:00:20.645667',
          dup_frames: 0,
          drop_frames: 0,
          speed: '2.9x'
        };
        sinon.stub(progress, '_parseProgress').returns(parsed);
        sinon.stub(progress, '_emitUpdateEvent');
        progress._processProgress(testChunk);
        const buf = progress.progressBuffer
        expect(buf[buf.length - 1]).to.deep.eql(parsed);
      });
    });
    describe('#_processLog', () => {
      it('adds the string to the log buffer', () => {
        const testChunk = 'abcdefghijklmnopqrstuvwxyz';
        sinon.stub(progress, 'lastMediaTime').returns(0);
        const expected = '(0) abcdefghijklmnopqrstuvwxyz';
        progress._processLog(testChunk);
        const buf = progress.logBuffer;
        expect(buf[buf.length - 1]).to.eql(expected);
      });
      it('trims whitespace from the right before adding', () => {
        const testChunk = 'abcdefghijklmnopqrstuvwxyz      \t  ';
        sinon.stub(progress, 'lastMediaTime').returns(0);
        const expected = '(0) abcdefghijklmnopqrstuvwxyz';
        progress._processLog(testChunk);
        const buf = progress.logBuffer;
        expect(buf[buf.length - 1]).to.eql(expected);
      });
      it('does not trim whitespace from the left before adding', () => {
        const testChunk = '  \t   abcdefghijklmnopqrstuvwxyz';
        sinon.stub(progress, 'lastMediaTime').returns(0);
        const expected = '(0)   \t   abcdefghijklmnopqrstuvwxyz';
        progress._processLog(testChunk);
        const buf = progress.logBuffer;
        expect(buf[buf.length - 1]).to.eql(expected);
      });
      it('does not add empty lines to the log buffer', () => {
        const testChunk = '';
        progress._processLog(testChunk);
        const buf = progress.logBuffer;
        expect(buf.length).to.eql(0);
      });
      it('does not add whitespace-only lines to the log buffer', () => {
        const testChunk = '   \t  \t ';
        progress._processLog(testChunk);
        const buf = progress.logBuffer;
        expect(buf.length).to.eql(0);
      });
      it('prefixes the line with the last received media time', () => {
        const testChunk = 'abcdefghijklmnopqrstuvwxyz';
        sinon.stub(progress, 'lastMediaTime').returns(27.639568);
        const expected = '(27.639568) abcdefghijklmnopqrstuvwxyz';
        progress._processLog(testChunk);
        const buf = progress.logBuffer;
        expect(buf[buf.length - 1]).to.eql(expected);
      });
    });
    describe('#_parseProgress', () => {
      it('parses key value pairs from a string', () => {
        const testChunk = 'abc=def\nghi=jkl';
        const expected = { abc: 'def', ghi: 'jkl' };
        expect(progress._parseProgress(testChunk)).to.eql(expected);
      });
      it('parses key value pairs with space between = and value', () => {
        const testChunk = 'abc=   def\nghi=   jkl';
        const expected = { abc: 'def', ghi: 'jkl' };
        expect(progress._parseProgress(testChunk)).to.eql(expected);
      });
      it('converts number values into numbers', () => {
        const testChunk = 'abc=   14.25\nghi=   321';
        const expected = { abc: 14.25, ghi: 321 };
        expect(progress._parseProgress(testChunk)).to.eql(expected);
      });
      it('parses timestamp formatted values into number of seconds', () => {
        const testChunk = 'abc=def\nghi=jkl\ntime=00:01:14.55';
        const expected = { abc: 'def', ghi: 'jkl', time: 74.55 };
        expect(progress._parseProgress(testChunk)).to.eql(expected);
      });
      it('correctly parses an example progress line', () => {
        const testChunk = 'frame=1145\nfps=75.03\nstream_0_1_q=40.0\nbitrate= 214.6kbits/s\ntotal_size=1310768\nout_time_us=48874667\nout_time_ms=48874667\nout_time=00:00:48.874667\ndup_frames=0\ndrop_frames=0\nspeed= 3.2x\nprogress=continue\n';
        const expected = {
          frame: 1145,
          fps: 75.03,
          stream_0_1_q: 40,
          bitrate: '214.6kbits/s',
          total_size: 1310768,
          out_time_us: 48874667,
          out_time_ms: 48874667,
          out_time: '00:00:48.874667',
          dup_frames: 0,
          drop_frames: 0,
          speed: '3.2x'
        };
        expect(progress._parseProgress(testChunk)).to.eql(expected);
      });
    });
  });
});
