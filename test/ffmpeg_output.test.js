const chai = require('chai'),
  expect = chai.expect,
  sinon = require('sinon'),
  fs = require('fs'),
  testHelpers = require('./helpers');

const FFmpegOutput = require('../lib/ffmpeg_output'),
  FFmpegOption = require('../lib/ffmpeg_option'),
  FilterNode = require('../lib/filter_node'),
  FilterGraph = require('../lib/filter_graph'),
  filtersFixture = fs.readFileSync(`${__dirname}/fixtures/ffmpeg-filters.out`).toString();

describe('FFmpegOutput', function () {
  it('creates an FFmpegOutput object', function () {
    const fi = new FFmpegOutput('/some/file.mp4');
    expect(fi).to.be.instanceof(FFmpegOutput);
  });
  it('disallows creating FFmpegOutput object with no file or url', function () {
    expect(() => new FFmpegOutput(null, {})).to.throw();
  });
  it('sets the options property on the object', function () {
    expect(new FFmpegOutput('/some/file.mov', new Map()).options).to.eql([]);
    expect(new FFmpegOutput('/some/file.mp4', {}).options).to.eql([]);
  });
  it('sets the url property on the object', function () {
    expect(new FFmpegOutput('/some/file.mp4', {}).url).to.eql('/some/file.mp4');
  });
  it('handles filenames with quotes properly', function () {
    const fo = new FFmpegOutput('/some/file with "quotes".mp4', {});
    const expectedCommandArray = ['/some/file with "quotes".mp4'];
    const expectedCommandString = '"/some/file with \\"quotes\\".mp4"';
    expect(fo.url).to.eql('/some/file with "quotes".mp4');
    expect(fo.toCommandArray()).to.deep.eql(expectedCommandArray);
    expect(fo.toCommandString()).to.eql(expectedCommandString);
  });
  it('generates the correct command array segment', function () {
    const expectedLast = '/some/file.mp4';
    const expectedArgs = [
      ['-dn'],
      ['-b:v', '3850k'],
      ['-f', 'mp4'],
      ['-aspect', '16:9']
    ];
    const foCmdObj = new FFmpegOutput('/some/file.mp4', {
      'dn': undefined,
      'aspect': '16:9',
      'f': 'mp4',
      'b:v': '3850k'
    }).toCommandArray();
    testHelpers.expectLast(foCmdObj, expectedLast);
    testHelpers.expectSequences(foCmdObj, expectedArgs);
    const foCmdMap = new FFmpegOutput('/some/file.mp4', new Map([
      ['dn'],
      ['b:v', '3850k'],
      ['f', 'mp4'],
      ['aspect', '16:9']
    ])).toCommandArray();
    testHelpers.expectLast(foCmdMap, expectedLast);
    testHelpers.expectSequences(foCmdMap, expectedArgs);
  });
  it('generates the correct command string segment', function () {
    const expected = '-dn -aspect "16:9" -f "mp4" -b:v "3850k" "/some/file.mp4"';
    const foObj = new FFmpegOutput('/some/file.mp4', {
      'dn': null,
      'aspect': '16:9',
      'f': 'mp4',
      'b:v': '3850k'
    });
    expect(foObj.toCommandString()).to.eql(expected);
    const foMap = new FFmpegOutput('/some/file.mp4', new Map([
      ['dn', null],
      ['aspect', '16:9'],
      ['f', 'mp4'],
      ['b:v', '3850k']
    ]));
    expect(foMap.toCommandString()).to.eql(expected);
  });
  describe('with filter option', function () {
    this.beforeEach(() => {
      // stub for ffmpeg interaction
      sinon.stub(FilterNode, '_queryFFmpegForFilters')
        .returns(filtersFixture);
      cropFilter = new FilterNode({
        filterName: 'crop',
        args: ['iw', 'ih/2', 0, 0]
      });
      vflipFilter = new FilterNode({ filterName: 'vflip' });
      hflipFilter = new FilterNode({ filterName: 'hflip' });
      splitFilter = new FilterNode({ filterName: 'split', outputsCount: 2 });
      const nodes = [cropFilter, vflipFilter, hflipFilter, splitFilter];
      const connections = [
        [[cropFilter, '0'], [splitFilter, '0']],
        [[splitFilter, '0'], [vflipFilter, '0']],
        [[splitFilter, '1'], [hflipFilter, '0']]
      ];
      fc = new FilterGraph(nodes, null, connections);
    });
  
    this.afterEach(() => {
      FilterNode._queryFFmpegForFilters.restore();
    });
    
    it('generates the correct command array segment', function () {
      const expectedLast = '/some/file.mp4';
      const expectedArgs = [
        ['-dn'],
        ['-filter_complex', `crop=iw:ih/2:0:0 [${cropFilter.padPrefix}_0];[${cropFilter.padPrefix}_0] split [${splitFilter.padPrefix}_0] [${splitFilter.padPrefix}_1];[${splitFilter.padPrefix}_0] vflip;[${splitFilter.padPrefix}_1] hflip`],
        ['-b:v', '3850k'],
        ['-f', 'mp4'],
        ['-aspect', '16:9']
      ];
      const fo = new FFmpegOutput('/some/file.mp4', new Map([
        ['dn', null],
        ['filter', fc],
        ['aspect', '16:9'],
        ['f', 'mp4'],
        ['b:v', '3850k']
      ])).toCommandArray();
      testHelpers.expectLast(fo, expectedLast);
      testHelpers.expectSequences(fo, expectedArgs);
    });
  });
  describe('addOptions', function () {
    it('allows adding options after creation of the output object', function () {
      const fo = new FFmpegOutput('/some/file.mp4', new Map());
      expect(fo.options).to.deep.eql([]);
      const newOptions = new Map([['dn', null], ['f', 'mp4']]);
      const expected = Array.from(newOptions).map(
        ([name, arg]) => new FFmpegOption(
          name,
          FFmpegOption.FFmpegOptionContexts.OUTPUT,
          arg
        )
      );
      fo.addOptions(newOptions);
      expect(fo.options).to.deep.eql(expected);
    });
    it('allows adding a filter option after creation of the output object', function () {
      sinon.stub(FilterNode, '_queryFFmpegForFilters')
        .returns(filtersFixture);
      const cropFilter = new FilterNode({
        filterName: 'crop',
        args: ['iw', 'ih/2', 0, 0]
      });
      const vflipFilter = new FilterNode({ filterName: 'vflip' });
      const hflipFilter = new FilterNode({ filterName: 'hflip' });
      const splitFilter = new FilterNode({
        filterName: 'split',
        outputsCount: 2
      });
      const nodes = [cropFilter, vflipFilter, hflipFilter, splitFilter];
      const connections = [
        [[cropFilter, '0'], [splitFilter, '0']],
        [[splitFilter, '0'], [vflipFilter, '0']],
        [[splitFilter, '1'], [hflipFilter, '0']]
      ];
      const fg = new FilterGraph(nodes, null, connections);
      const fo = new FFmpegOutput('/some/file.mp4', new Map());
      expect(fo.options).to.deep.eql([]);
      const newOptions = new Map([['filter', fg],]);
      const expected = [new FFmpegOption(
        'filter_complex',
        FFmpegOption.FFmpegOptionContexts.OUTPUT,
        fg
      ),];
      fo.addOptions(newOptions);
      expect(fo.options).to.deep.eql(expected);
      FilterNode._queryFFmpegForFilters.restore();
    });
  });
});
