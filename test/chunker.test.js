const Chunker = require('../lib/util/chunker');

const chai = require('chai'),
  expect = chai.expect,
  sinon = require('sinon');

const { createTestReadableStream } = require('./helpers');

describe('Chunker', () => {
  let readable, chunker;
  beforeEach(() => {
    readable = createTestReadableStream();
    chunker = new Chunker;
  });

  it('should split text pushed into it', (done) => {
    const simpleData = [
      ': Video: h264 (libx264) (avc1 / 0x31637661), yuv422p10le, 640x360 [SAR 1:1 DAR 16:9], q=-1--1, 23.98 fps, 24k tbn, 23.98 tbc (default)\n',
      '    Metadata:\n      encoder         : Lavc58.55.101 libx264\n',
      '    Side data:\n',
      '      cpb: bitrate max/min/avg: 0/0/0 buffer size: 0 vbv_delay: 18446744073709551615',
      '\n'
    ];
    let bufferedData = [];
    readable.pipe(chunker);
    for (let chunk of simpleData) {
      readable.push(chunk);
    }
    readable.push(null);
    chunker.on('data', (data) => {
      bufferedData.push(data);
    });
    chunker.on('finish', () => {
      const expected = bufferedData.map((d) => d.toString());
      expect(expected).to.eql([
        ': Video: h264 (libx264) (avc1 / 0x31637661), yuv422p10le, 640x360 [SAR 1:1 DAR 16:9], q=-1--1, 23.98 fps, 24k tbn, 23.98 tbc (default)\n',
        '    Metadata:\n',
        '      encoder         : Lavc58.55.101 libx264\n',
        '    Side data:\n',
        '      cpb: bitrate max/min/avg: 0/0/0 buffer size: 0 vbv_delay: 18446744073709551615\n'
      ]);
      done();
    });
  });

  it('should provide leftover data', (done) => {
    const leftoverData = [
      '    Side data:\n',
      '      cpb: bitrate max/min/avg: 0/0/0 buffer size: 0 vbv_delay: 18446744073709551615',
    ];

    let bufferedData = [];
    readable.pipe(chunker);
    for (let chunk of leftoverData) {
      readable.push(chunk);
    }
    readable.push(null);
    chunker.on('data', (data) => {
      bufferedData.push(data);
    });
    chunker.on('finish', () => {
      const expected = bufferedData.map((d) => d.toString())
      expect(expected).to.eql([
        '    Side data:\n',
        '      cpb: bitrate max/min/avg: 0/0/0 buffer size: 0 vbv_delay: 18446744073709551615'
      ]);
      done();
    });
  });

  it('should split carriage returns and newlines', (done) => {
    const complicatedData = [
      'frame=   12 fps=0.0 q=0.0 size=       0kB time=00:00:01.60 bitrate=   0.2kbits/s speed=3.09x    \rframe=12\nfps=0.00\nstream_0_1_q=0.0\nbitrate=   0.2kbits/s\ntotal_size=48\nout_time_us=1600000\nout_time_ms=1600000\nout_time=00:00:01.600000\ndup_frames=0\ndrop_frames=0\nspeed=3.09x\nprogress=continue\n',
      '[Parsed_subtitles_0 @ 0x564306194500] ',
      'fontselect: (HelveticaNeueLTStd-Blk, 400, 0) -> /usr/share/fonts/opentype/helvetica_neue_lt_std/HelveticaNeueLTStd-Blk.otf, 0, HelveticaNeueLTStd-Blk\n',
    ];
    let bufferedData = [];
    readable.pipe(chunker);
    for (let chunk of complicatedData) {
      readable.push(chunk);
    }
    readable.push(null);
    chunker.on('data', (data) => {
      bufferedData.push(data);
    });
    chunker.on('finish', () => {
      const expected = bufferedData.map((d) => d.toString());
      expect(expected).to.eql([
        'frame=   12 fps=0.0 q=0.0 size=       0kB time=00:00:01.60 bitrate=   0.2kbits/s speed=3.09x    \r',
        'frame=12\n',
        'fps=0.00\n',
        'stream_0_1_q=0.0\n',
        'bitrate=   0.2kbits/s\n',
        'total_size=48\n',
        'out_time_us=1600000\n',
        'out_time_ms=1600000\n',
        'out_time=00:00:01.600000\n',
        'dup_frames=0\n',
        'drop_frames=0\n',
        'speed=3.09x\n',
        'progress=continue\n',
        '[Parsed_subtitles_0 @ 0x564306194500] fontselect: (HelveticaNeueLTStd-Blk, 400, 0) -> /usr/share/fonts/opentype/helvetica_neue_lt_std/HelveticaNeueLTStd-Blk.otf, 0, HelveticaNeueLTStd-Blk\n',
      ]);
      done();
    });
  });
});
