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
      const progressChunk = 'frame= 1781 fps=161 q=28.0 size=    2304kB time=00:01:14.55 bitrate= 253.1kbits/s speed=6.75x   \r';
      progress.on('update', (data) => {
        expect(data).to.be.an('object');
        expect(data).to.have.ownProperty('time');
        expect(data.time).to.eql(74.55);
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
      it('returns an object with the correct fields', () => {
        const testChunk = 'frame= 1781 fps=161 q=28.0 size=    2304kB time=00:01:14.55 bitrate= 253.1kbits/s speed=6.75x   \rframe= 1781 fps=161 ';
        const result = progress._nextProcessablePiece(testChunk);
        expect(result).to.have.property('index');
        expect(result.index).to.be.a('number');
        expect(result).to.have.property('type');
        expect(result.type).to.be.a('string');
        expect(result).to.have.property('continueProgressMode');
        expect(result.continueProgressMode).to.be.a('boolean');
      });
      it('returns type progress if progressMode is true and chunk is parseable as progress', () => {
        const testChunk = 'abcde=fghijklmnopqr\nstuvwxyz';
        progress.progressMode = true;
        const result = progress._nextProcessablePiece(testChunk);
        expect(result.type).to.eql('progress');
      });
      it('returns type progress if there is a CR before a newline', () => {
        const testChunk = 'abcd=efghi\rjklmnopqr\nstuvwxyz';
        progress.progressMode = true;
        let result = progress._nextProcessablePiece(testChunk);
        expect(result.type).to.eql('progress');
        progress.progressMode = false;
        result = progress._nextProcessablePiece(testChunk);
        expect(result.type).to.eql('progress');
      });
      it('returns type progress if there is a CR and no newline', () => {
        const testChunk = 'abcd=efghi\rjklmnopqrstuvwxyz';
        progress.progressMode = true;
        let result = progress._nextProcessablePiece(testChunk);
        expect(result.type).to.eql('progress');
        progress.progressMode = false;
        result = progress._nextProcessablePiece(testChunk);
        expect(result.type).to.eql('progress');
      });
      it('returns type log if progressMode is false and there is a newline before a CR', () => {
        const testChunk = 'abcdefghi\njklm=nopqr\rstuvwxyz';
        progress.progressMode = false;
        const result = progress._nextProcessablePiece(testChunk);
        expect(result.type).to.eql('log');
      });
      it('returns type log if progressMode is false and there is a newline and no CR', () => {
        const testChunk = 'abcdefghi\njklmnopqrstuvwxyz';
        progress.progressMode = false;
        const result = progress._nextProcessablePiece(testChunk);
        expect(result.type).to.eql('log');
      });
      it('returns continueProgressMode true if there is a CR next', () => {
        let testChunk = 'abcd=efghi\rjklmnopqrstuvwxyz';
        progress.progressMode = true;
        let result = progress._nextProcessablePiece(testChunk);
        expect(result.continueProgressMode).to.eql(true);
        progress.progressMode = false;
        result = progress._nextProcessablePiece(testChunk);
        expect(result.continueProgressMode).to.eql(true);
        testChunk = 'abcd=efghi\rjklmnopqr\nstuvwxyz';
        progress.progressMode = true;
        result = progress._nextProcessablePiece(testChunk);
        expect(result.continueProgressMode).to.eql(true);
        progress.progressMode = false;
        result = progress._nextProcessablePiece(testChunk);
        expect(result.continueProgressMode).to.eql(true);
      });
      it('returns continueProgressMode false if already true and there is a newline next', () => {
        let testChunk = 'abcdefghi\njklmn=opqr\rstuvwxyz';
        progress.progressMode = true;
        let result = progress._nextProcessablePiece(testChunk);
        expect(result.continueProgressMode).to.eql(false);
        testChunk = 'abcdefghi\njklmnopqrstuvwxyz';
        result = progress._nextProcessablePiece(testChunk);
        expect(result.continueProgressMode).to.eql(false);
      });
      it('returns continueProgressMode false if already false and there is no CR next', () => {
        let testChunk = 'abcdefghi\njklmn=opqr\rstuvwxyz';
        progress.progressMode = false;
        let result = progress._nextProcessablePiece(testChunk);
        expect(result.continueProgressMode).to.eql(false);
        testChunk = 'abcdefghi\njklmnopqrstuvwxyz';
        result = progress._nextProcessablePiece(testChunk);
        expect(result.continueProgressMode).to.eql(false);
      });
      it('returns type log and continueProgressMode false if next chunk unparseable as progress', () => {
        let testChunk = 'abcdefghi\njklmnopqrstuvwxyz';
        progress.progressMode = true;
        let result = progress._nextProcessablePiece(testChunk);
        expect(result.type).to.eql('log');
        expect(result.continueProgressMode).to.eql(false);
      });
    });
    describe('#_processPiece', () => {
      it('calls #_processProgress when mode is progress', () => {
        const stub = sinon.stub(progress, '_processProgress');
        progress._processPiece('some string', 'progress');
        expect(stub.calledOnceWithExactly('some string')).to.eql(true);
      });
      it('calls #_processLog when mode is log', () => {
        const stub = sinon.stub(progress, '_processLog');
        progress._processPiece('some string', 'log');
        expect(stub.calledOnceWithExactly('some string')).to.eql(true);
      });
    });
    describe('#_processProgress', () => {
      it('calls _parseProgress', () => {
        const testChunk = 'frame= 1781 fps=161 q=28.0 size=    2304kB time=00:01:14.55 bitrate= 253.1kbits/s speed=6.75x   ';
        const stub = sinon.stub(progress, '_parseProgress');
        sinon.stub(progress, '_emitUpdateEvent');
        progress._processProgress(testChunk);
        expect(stub.calledOnceWithExactly(testChunk)).to.eql(true);
      });
      it('calls _emitUpdateEvent', () => {
        const testChunk = 'frame= 1781 fps=161 q=28.0 size=    2304kB time=00:01:14.55 bitrate= 253.1kbits/s speed=6.75x   ';
        const parsed = {
          frame: 1781,
          fps: 161,
          q: 28,
          size: '2304kB',
          time: 74.55,
          bitrate: '253.1kbits/s',
          speed: '6.75x'
        };
        sinon.stub(progress, '_parseProgress').returns(parsed);
        const stub = sinon.stub(progress, '_emitUpdateEvent');
        progress._processProgress(testChunk);
        expect(stub.calledOnceWithExactly(parsed)).to.eql(true);
      });
      it('adds parsed progress data to the progress buffer', () => {
        const testChunk = 'frame= 1781 fps=161 q=28.0 size=    2304kB time=00:01:14.55 bitrate= 253.1kbits/s speed=6.75x   ';
        const parsed = {
          frame: 1781,
          fps: 161,
          q: 28,
          size: '2304kB',
          time: 74.55,
          bitrate: '253.1kbits/s',
          speed: '6.75x'
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
        progress._processLog(testChunk);
        const buf = progress.logBuffer;
        expect(buf[buf.length - 1]).to.eql(testChunk);
      });
      it('trims whitespace from the right before adding', () => {
        const testChunk = 'abcdefghijklmnopqrstuvwxyz      \t  ';
        const expected = 'abcdefghijklmnopqrstuvwxyz';
        progress._processLog(testChunk);
        const buf = progress.logBuffer;
        expect(buf[buf.length - 1]).to.eql(expected);
      });
      it('does not trim whitespace from the left before adding', () => {
        const testChunk = '  \t   abcdefghijklmnopqrstuvwxyz';
        progress._processLog(testChunk);
        const buf = progress.logBuffer;
        expect(buf[buf.length - 1]).to.eql(testChunk);
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
    });
    describe('#_parseProgress', () => {
      it('parses key value pairs from a string', () => {
        const testChunk = 'abc=def ghi=jkl';
        const expected = { abc: 'def', ghi: 'jkl' };
        expect(progress._parseProgress(testChunk)).to.eql(expected);
      });
      it('parses key value pairs with space between = and value', () => {
        const testChunk = 'abc=   def ghi=   jkl';
        const expected = { abc: 'def', ghi: 'jkl' };
        expect(progress._parseProgress(testChunk)).to.eql(expected);
      });
      it('converts number values into numbers', () => {
        const testChunk = 'abc=   14.25 ghi=   321';
        const expected = { abc: 14.25, ghi: 321 };
        expect(progress._parseProgress(testChunk)).to.eql(expected);
      });
      it('parses timestamp formatted values into number of seconds', () => {
        const testChunk = 'abc=def ghi=jkl time=00:01:14.55';
        const expected = { abc: 'def', ghi: 'jkl', time: 74.55 };
        expect(progress._parseProgress(testChunk)).to.eql(expected);
      });
      it('correctly parses an example progress line', () => {
        const testChunk = 'frame= 1781 fps=161 q=28.0 size=    2304kB time=00:01:14.55 bitrate= 253.1kbits/s speed=6.75x   ';
        const expected = {
          frame: 1781,
          fps: 161,
          q: 28,
          size: '2304kB',
          time: 74.55,
          bitrate: '253.1kbits/s',
          speed: '6.75x'
        };
        expect(progress._parseProgress(testChunk)).to.eql(expected);
      });
    });
    describe('#_parseTimestamp', () => {
      it('correctly parses a timestamp string with only seconds', () => {
        const ts = '00:00:13.57';
        const expected = 13.57;
        expect(progress._parseTimestamp(ts)).to.eql(expected);
      });
      it('correctly parses a timestamp string with only minutes', () => {
        const ts = '00:53:00.00';
        const expected = 53 * 60;
        expect(progress._parseTimestamp(ts)).to.eql(expected);
      });
      it('correctly parses a timestamp string with only hours', () => {
        const ts = '17:00:00.00';
        const expected = 17 * 60 * 60;
        expect(progress._parseTimestamp(ts)).to.eql(expected);
      });
      it('correctly parses a timestamp string with all fields', () => {
        const ts = '17:53:13.57';
        const expected = 17 * 60 * 60 + 53 * 60 + 13.57;
        expect(progress._parseTimestamp(ts)).to.eql(expected);
      });
    });
  });
});
