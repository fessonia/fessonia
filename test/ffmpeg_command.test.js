const chai = require('chai'),
  expect = chai.expect,
  sinon = require('sinon'),
  events = require('events'),
  stream = require('stream'),
  childProcess = require('child_process'),
  testHelpers = require('./helpers');

const FFmpegCommand = require('../lib/ffmpeg_command');
const FFmpegInput = require('../lib/ffmpeg_input');
const FFmpegOutput = require('../lib/ffmpeg_output');
const FilterNode = require('../lib/filter_node');
const FilterGraph = require('../lib/filter_graph');
const config = require('../lib/util/config')();

describe('FFmpegCommand', function () {
  it('creates an FFmpegCommand object', function () {
    const fc = new FFmpegCommand();
    expect(fc).to.be.instanceof(FFmpegCommand);
  });
  it('sets the options property on the object', function () {
    expect(new FFmpegCommand().options).to.eql(new Map());
    expect(new FFmpegCommand(new Map()).options).to.eql(new Map());
    expect(new FFmpegCommand({}).options).to.eql(new Map());
  });
  it('allows adding inputs on and retrieving inputs from the object', function () {
    const fc = new FFmpegCommand();
    const fi = new FFmpegInput('/some/file.mov', {});
    fc.addInput(fi);
    expect(fc.inputs()).to.contain(fi);
  });
  it('sets the labels on inputs as they are added', function () {
    const fc = new FFmpegCommand();
    expect(fc.inputs().length).to.eql(0);
    const fi1 = new FFmpegInput('/some/file1.mov', {});
    fc.addInput(fi1);
    expect(fc.inputs().length).to.eql(1);
    expect(fi1.inputLabel).to.eql('0');
    const fi2 = new FFmpegInput('/some/file2.mov', {});
    fc.addInput(fi2);
    expect(fc.inputs().length).to.eql(2);
    expect(fi2.inputLabel).to.eql('1');
  });
  it('allows adding outputs on and retrieving outputs from the object', function () {
    const fc = new FFmpegCommand();
    const fo = new FFmpegOutput('/some/file.mov', {});
    fc.addOutput(fo);
    expect(fc.outputs()).to.contain(fo);
  });
  // TODO: when work in FilterGraph is done, continue here.
  it.skip('it allows mapping inputs to outputs', function () {
    const fc = new FFmpegCommand();
    const result = fc.mapIO('input_tag', 0, 'output_tag', 3);
    expect(result).to.be.true;
  });
  it.skip('it allows getting mapped inputs and outputs', function () {
    const fc = new FFmpegCommand();
    fc.mapIO('input_tag', 0, 'output_tag', 3);
    const expected = new Map([
      [
        'input_tag',
        new Map([
          [0, { output_tag: 3 }]
        ])
      ]
    ]);
    const result = fc.mappedIO();
    expect(result.size).to.eql(expected.size);
    for (let [fromKey, fromVal] of result) {
      for (let [fromIndex, toVal] of fromVal) {
        expect(toVal).to.deep.eql(expected.get(fromKey).get(fromIndex));
      }
    }
  });
  it.skip('it warns when overwriting a mapping', function () {
    const fc = new FFmpegCommand();
    fc.mapIO('input_tag', 0, 'output_tag', 2);
    expect(() => fc.mapIO('input_tag', 0, 'output_tag', 3)).to.warn;
    const expected = new Map([['input_tag', new Map([[0, { output_tag: 3 }]])]]);
    const result = fc.mappedIO();
    expect(result.size).to.eql(expected.size);
    for (let [fromKey, fromVal] of result) {
      for (let [fromIndex, toVal] of fromVal) {
        expect(toVal).to.deep.eql(expected.get(fromKey).get(fromIndex));
      }
    }
  });
  it('generates the correct command object', function () {
    const fc = new FFmpegCommand(new Map([['y'],]));
    const fi = new FFmpegInput('/some/file.mov', new Map([
      ['threads', '8'],
      ['itsoffset', '0'],
      ['ss', '6234.0182917']
    ]));
    const fo = new FFmpegOutput('/dev/null', new Map([
      ['c:v', 'libx264'],
      ['preset:v', 'slow'],
      ['profile:v', 'high'],
      ['pix_fmt', 'yuv420p'],
      ['coder', '1'],
      ['g', '48'],
      ['b:v', '3850k'],
      ['flags', '+bitexact'],
      ['sws_flags', '+accurate_rnd+bitexact'],
      ['fflags', '+bitexact'],
      ['maxrate', '4000k'],
      ['bufsize', '2850k'],
      ['an'],
      ['f', 'mp4'],
      ['aspect', '16:9'],
      ['pass', '1'],
    ]));
    fc.addInput(fi);
    fc.addOutput(fo);
    const fcCmd = fc.toCommand();
    const expected = {
      command: config.ffmpeg_bin,
      seqs: [
        fi.toCommandArray(),
        fo.toCommandArray(),
        fi.toCommandArray().concat(fo.toCommandArray()),
        [
          '-y',
          '-threads', '8',
          '-itsoffset', '0',
          '-ss', '6234.0182917',
          '-i', '/some/file.mov',
          '-c:v', 'libx264',
          '-preset:v', 'slow',
          '-profile:v', 'high',
          '-pix_fmt', 'yuv420p',
          '-coder', '1',
          '-g', '48',
          '-b:v', '3850k',
          '-flags', '+bitexact',
          '-sws_flags', '+accurate_rnd+bitexact',
          '-fflags', '+bitexact',
          '-maxrate', '4000k',
          '-bufsize', '2850k',
          '-an',
          '-f', 'mp4',
          '-aspect', '16:9',
          '-pass', '1',
          '/dev/null',
        ]
      ]
    };
    expect(fcCmd.command).to.eql(expected.command);
    testHelpers.expectSequences(fcCmd.args, expected.seqs);
  });
  it('generates the correct command string', function () {
    const fc = new FFmpegCommand(new Map([['y'],]));
    const fi = new FFmpegInput('/some/file.mov', new Map([
      ['threads', '8'],
      ['itsoffset', '0'],
      ['ss', '6234.0182917']
    ]));
    const fo = new FFmpegOutput('/dev/null', new Map([
      ['c:v', 'libx264'],
      ['preset:v', 'slow'],
      ['profile:v', 'high'],
      ['pix_fmt', 'yuv420p'],
      ['coder', '1'],
      ['g', '48'],
      ['b:v', '3850k'],
      ['flags', '+bitexact'],
      ['sws_flags', '+accurate_rnd+bitexact'],
      ['fflags', '+bitexact'],
      ['maxrate', '4000k'],
      ['bufsize', '2850k'],
      ['an'],
      ['f', 'mp4'],
      ['aspect', '16:9'],
      ['pass', '1'],
    ]));
    fc.addInput(fi);
    fc.addOutput(fo);
    const expected = `${config.ffmpeg_bin} -y -threads "8" -itsoffset "0" -ss "6234.0182917" -i "/some/file.mov" -c:v "libx264" -preset:v "slow" -profile:v "high" -pix_fmt "yuv420p" -coder "1" -g "48" -b:v "3850k" -flags "+bitexact" -sws_flags "+accurate_rnd+bitexact" -fflags "+bitexact" -maxrate "4000k" -bufsize "2850k" -an -f "mp4" -aspect "16:9" -pass "1" "/dev/null"`;
    expect(fc.toString()).to.eql(expected);
  });
  it.skip('generates the correct command string when IO mappings are present', function () {
    const fc = new FFmpegCommand(new Map([['y'],]));
    let filterInput = new FilterNode('sine', {
      filterName: 'sine',
      args: [
        { name: 'frequency', value: 620 },
        { name: 'beep_factor', value: 4 },
        { name: 'duration', value: 9999999999 },
        { name: 'sample_rate', value: 48000 }
      ]
    });
    let sineInput = new FFmpegInput(filterInput, new Map([
      ['re', null],
      ['r', 23.976],
      ['f', 'lavfi']
    ]));
    fc.addInput(sineInput);
    let nodes = [
      new FilterNode('life', {
        filterName: 'life',
        args: [
          { name: 'size', value: '320x240' },
          { name: 'mold', value: 10 },
          { name: 'rate', value: 23.976 },
          { name: 'ratio', value: 0.5 },
          { name: 'death_color', value: '#C83232' },
          { name: 'life_color', value: '#00ff00' },
          { name: 'stitch', value: 0 }
        ]
      }),
      new FilterNode('scale', {
        filterName: 'scale',
        args: [1920, 1080]
      })
    ];
    let connections = [[['life', '0'], ['scale', '0']]];
    let filterGraphInput = new FilterGraph('my_input_filter', nodes, null, connections);
    let lifeInput = new FFmpegInput(filterGraphInput, new Map([
      ['re', null],
      ['r', 23.976],
      ['f', 'lavfi']
    ]));
    fc.addInput(lifeInput);
    let output = new FFmpegOutput('gen.mov', new Map([
      ['c:v', 'prores'],
      ['c:a', 'pcm_s24le'],
      ['aspect', '16:9']
    ]));
    fc.addOutput(output, mappings = [[lifeInput, 0], [sineInput, 0], [sineInput, 0]]);
    const expected = `${config.ffmpeg_bin} -re -r "23.976" -f "lavfi" -i "life=size=320x240:mold=10:rate=23.976:ratio=0.5:death_color=#C83232:life_color=#00ff00:stitch=0,scale=1920:1080" -re -f "lavfi" -i "sine=frequency=620:beep_factor=4:duration=9999999999:sample_rate=48000" -c:v "prores" -c:a "pcm_s24le" -aspect "16:9" -map "0:0" -map "1:0" -map "1:0" "gen.mov"`;
    expect(fc.toString()).to.eql(expected);
  });

  describe('event emits', function () {
    beforeEach(() => {
      mockProcess = new events.EventEmitter();
      mockProcess.stderr = new stream.Readable();
      mockProcess.stderr._read = sinon.spy();
      stub = sinon.stub(childProcess, 'spawn').returns(mockProcess);
    });
    afterEach(() => {
      childProcess.spawn.restore();
    });
    it('sets up proper listeners on the process', function () {
      const mock = sinon.mock(mockProcess);
      mock.expects('on').withArgs('exit').once();
      mock.expects('on').withArgs('error').once();
      const fc = new FFmpegCommand();
      fc.spawn();
      mock.verify();
    });
    it('emits a success event when the process executes successfully', function (done) {
      const fc = new FFmpegCommand();
      fc.on('success', (data) => {
        expect(data).to.have.ownProperty('exitCode');
        expect(data).to.have.ownProperty('progressData');
        expect(data.exitCode).to.eql(0);
        done();
      });
      fc.on('error', (err) => {
        throw new Error(`Expected success event but error event received: ${err.message}`);
      });
      fc.on('failure', (data) => {
        throw new Error(`Expected success event but received failure event with data ${JSON.stringify(data)}`);
      });
      fc.spawn();
      mockProcess.emit('exit', 0, null);
    });
    it('emits a failure event when the process spawns but fails to execute successfully', function (done) {
      const fc = new FFmpegCommand();
      fc.on('success', (data) => {
        throw new Error(`Expected failure event but received success event with data ${JSON.stringify(data)}.`);
      });
      fc.on('error', (err) => {
        throw new Error(`Expected failure event but error event received: ${err.message}`);
      });
      fc.on('failure', (data) => {
        expect(data).to.have.ownProperty('exitCode');
        expect(data).to.have.ownProperty('progressData');
        expect(data.exitCode).to.eql(1);
        done();
      });
      fc.spawn();
      mockProcess.emit('exit', 1, null);
    });
  });
});
