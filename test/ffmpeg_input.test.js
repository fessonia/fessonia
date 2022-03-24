const chai = require('chai'),
  expect = chai.expect,
  sinon = require('sinon'),
  fs = require('fs'),
  testHelpers = require('./helpers');

const FFmpegInput = require('../lib/ffmpeg_input');
const FilterGraph = require('../lib/filter_graph');
const FilterChain = require('../lib/filter_chain');
const FilterNode = require('../lib/filter_node');

describe('FFmpegInput', function () {
  describe('constructor()', function () {
    it('creates an FFmpegInput object', function () {
      const fi = new FFmpegInput('/some/file.mov', {});
      expect(fi).to.be.instanceof(FFmpegInput);
    });
    it('creates an FFmpegInput object with undefined options', () => {
      const fi = new FFmpegInput('/some/url')
      expect(fi).to.be.instanceof(FFmpegInput)
    })
    it('disallows creating FFmpegInput object with no file or url', function () {
      expect(() => new FFmpegInput(null, {})).to.throw();
    });
    it('disallows creating FFmpegInput object with non-string non-filter url', function () {
      expect(() => new FFmpegInput(['some', 'values'])).to.throw();
    });
    it('sets the options property on the object', function () {
      expect(new FFmpegInput('/some/file.mov', new Map()).options).to.eql([]);
      expect(new FFmpegInput('/some/file.mov', {}).options).to.eql([]);
    });
    it('sets the url property on the object', function () {
      const input_file = '/some/file.mov';
      expect(new FFmpegInput(input_file, {}).url).to.eql(input_file);
    });
  });
  describe('toCommandArray(), toCommandString()', function () {
    it('handles filenames with quotes properly', function () {
      const fi = new FFmpegInput('/some/file with "quotes".mp4');
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
  });
  describe('filters as input', function () {
    this.beforeEach(() => {
      cropFilter = new FilterNode('crop', ['iw', 'ih/2', 0, 0]);
      vflipFilter = new FilterNode('vflip');
      splitFilter = new FilterNode('split', []);
      nodes = [ cropFilter, vflipFilter, splitFilter ];
      fc = new FilterChain(nodes);
    });

    it('handles a single filter as input', function () {
      let fInput = new FilterNode('sine', {
        frequency: 620,
        beep_factor: 4,
        duration: 9999999999,
        sample_rate: 48000
      });
      let expected = '-re -f "lavfi" -i "sine=frequency=620:beep_factor=4:duration=9999999999:sample_rate=48000"';
      let fiObj = new FFmpegInput(fInput, new Map([
        ['re', null],
        ['f', 'lavfi']
      ]));
      expect(fiObj.toCommandString()).to.eql(expected);
    });

    it('handles a filter chain as input', function () {
      const lifeNode = new FilterNode('life', {
        size: '320x240',
        mold: 10,
        rate: 23.976,
        ratio: 0.5,
        death_color: '#C83232',
        life_color: '#00ff00',
        stitch: 0
      });
      const scaleNode = new FilterNode('scale', [1920, 1080]);
      const expected = '-re -r "23.976" -f "lavfi" -i "life=size=320x240:mold=10:rate=23.976:ratio=0.5:death_color=#C83232:life_color=#00ff00:stitch=0,scale=1920:1080"';
      const fcInput = new FilterChain([lifeNode, scaleNode]);
      const fiObj = new FFmpegInput(fcInput, new Map([
        ['re', null],
        ['r', 23.976],
        ['f', 'lavfi']
      ]));
      expect(fiObj.toCommandString()).to.eql(expected);
    });

    it('handles a filter graph as input', function () {
      const lifeNode = new FilterNode('life', {
        size: '320x240',
        mold: 10,
        rate: 23.976,
        ratio: 0.5,
        death_color: '#C83232',
        life_color: '#00ff00',
        stitch: 0
      });
      const scaleNode = new FilterNode('scale', [1920, 1080]);
      const expected = '-re -r "23.976" -f "lavfi" -i "life=size=320x240:mold=10:rate=23.976:ratio=0.5:death_color=#C83232:life_color=#00ff00:stitch=0,scale=1920:1080"';
      const fc = new FilterChain([lifeNode, scaleNode]);
      const fgInput = new FilterGraph();
      fgInput.addFilterChain(fc);
      const fiObj = new FFmpegInput(fgInput, new Map([
        ['re', null],
        ['r', 23.976],
        ['f', 'lavfi']
      ]));
      expect(fiObj.toCommandString()).to.eql(expected);
    });

    describe('inputLabel property (get & set)', function () {
      beforeEach(function () {
        fi = new FFmpegInput('/some/file.mov');
      });

      it('returns an undefined label prior to setting', function () {
        expect(fi.inputLabel).to.be.undefined;
      });
      it('allows setting and getting an input label', function () {
        fi.inputLabel = '0';
        expect(fi.inputLabel).to.eql('0');
        fi.inputLabel = 1;
        expect(fi.inputLabel).to.eql('1');
      });
      it('rejects setting an input label to non-stringifiable values', function () {
        expect(() => { fi.inputLabel = undefined }).to.throw();
      });
    });
  });
});
