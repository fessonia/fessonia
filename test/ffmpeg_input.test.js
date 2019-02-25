const chai = require('chai'),
  expect = chai.expect,
  sinon = require('sinon'),
  fs = require('fs'),
  testHelpers = require('./helpers');

const FFmpegInput = require('../lib/ffmpeg_input');
const FilterChain = require('../lib/filter_chain');
const FilterNode = require('../lib/filter_node');
const filtersFixture = fs.readFileSync(`${__dirname}/fixtures/ffmpeg-filters.out`).toString();

describe('FFmpegInput', function () {
  it('creates an FFmpegInput object', function () {
    const fi = new FFmpegInput('/some/file.mov');
    expect(fi).to.be.instanceof(FFmpegInput);
  });
  it('disallows creating FFmpegInput object with no file or url', function () {
    expect(() => new FFmpegInput(null, {})).to.throw();
  });
  it('sets the options property on the object', function () {
    expect(new FFmpegInput('/some/file.mov', new Map()).options).to.eql([]);
    expect(new FFmpegInput('/some/file.mov', {}).options).to.eql([]);
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
      ['-ss', '5110.77'],
      ['-itsoffset', '0'],
      ['-bitexact'],
      ['-i', '/some/file.mov']
    ];
    const fiCmdObj = new FFmpegInput('/some/file.mov', {
      'ss': 5110.77,
      'itsoffset': 0,
      'bitexact': undefined
    }).toCommandArray();
    testHelpers.expectLast(fiCmdObj, expectedLast);
    testHelpers.expectSequences(fiCmdObj, expectedArgs);
    const fiCmdMap = new FFmpegInput('/some/file.mov', new Map([
      ['ss', 5110.77],
      ['itsoffset', 0],
      ['bitexact']
    ])).toCommandArray();
    testHelpers.expectLast(fiCmdMap, expectedLast);
    testHelpers.expectSequences(fiCmdMap, expectedArgs);
  });
  it('generates the correct command string segment', function () {
    const expected = '-ss "5110.77" -itsoffset "0" -bitexact -i "/some/file.mov"';
    const fiObj = new FFmpegInput('/some/file.mov', {
      'ss': 5110.77,
      'itsoffset': 0,
      'bitexact': null
    });
    expect(fiObj.toCommandString()).to.eql(expected);
    const fiMap = new FFmpegInput('/some/file.mov', new Map([
      ['ss', 5110.77],
      ['itsoffset', 0],
      ['bitexact', null]
    ]));
    expect(fiMap.toCommandString()).to.eql(expected);
  });
  describe('filters as input', function () {
    this.beforeEach(() => {
      // stub for ffmpeg interaction
      sinon.stub(FilterNode, '_queryFFmpegForFilters')
        .returns(filtersFixture);
      nodes = [
        new FilterNode('cropFilter', {
          filterName: 'crop',
          args: ['iw', 'ih/2', 0, 0]
        }),
        new FilterNode('vflipFilter', { filterName: 'vflip' }),
        new FilterNode('splitFilter', { filterName: 'split' })
      ];
      fc = new FilterChain('my_filter_chain', nodes);
    });

    this.afterEach(() => {
      FilterNode._queryFFmpegForFilters.restore();
    });

    it('handles a single filter as input', function () {
      let expected = '-re -f "lavfi" -i "sine=frequency=620:beep_factor=4:duration=9999999999:sample_rate=48000"';
      let fInput = new FilterNode('sine', {
        filterName: 'sine',
        args: [
          { name: 'frequency', value: 620 },
          { name: 'beep_factor', value: 4 },
          { name: 'duration', value: 9999999999 },
          { name: 'sample_rate', value: 48000 }
        ]
      });
      let fiObj = new FFmpegInput(fInput, new Map([
        ['re', null],
        ['f', 'lavfi']
      ]));
      expect(fiObj.toCommandString()).to.eql(expected);
    });

    it('handles a filter chain as input', function () {
      let expected = '-re -r "23.976" -f "lavfi" -i "life=size=320x240:mold=10:rate=23.976:ratio=0.5:death_color=#C83232:life_color=#00ff00:stitch=0 [life_0];[life_0] scale=1920:1080"';
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
      let fcInput = new FilterChain('my_input_filter', nodes, null, connections);
      let fiObj = new FFmpegInput(fcInput, new Map([
        ['re', null],
        ['r', 23.976],
        ['f', 'lavfi']
      ]));
      expect(fiObj.toCommandString()).to.eql(expected);
    });
  });
});
