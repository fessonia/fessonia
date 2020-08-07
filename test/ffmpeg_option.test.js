const chai = require('chai'),
  expect = chai.expect,
  sinon = require('sinon'),
  fs = require('fs'),
  testHelpers = require('./helpers');

const FFmpegOption = require('../lib/ffmpeg_option');
const FilterGraph = require('../lib/filter_graph');
const FilterChain = require('../lib/filter_chain');
const FilterNode = require('../lib/filter_node');

describe('FFmpegOption', function () {
  it('creates an FFmpegOption object', function () {
    expect(new FFmpegOption(
      'ss'
    )).to.be.instanceof(FFmpegOption);
  });
  describe('input validation', function () {
    it('sets the argument when arg is a string', function () {
      const fo = new FFmpegOption('ss', '2545');
      expect(fo.arg).to.be.a('string');
      expect(fo.arg).to.eql('2545');
    });
    it('sets the argument when arg is stringifiable', function () {
      const fo = new FFmpegOption('ss', 2545);
      expect(fo.arg).to.eql(2545);
    });
    it('fails if arg is a composite value', function () {
      expect(() => new FFmpegOption('ss', new Map([[2545, null]]))).to.throw();
      expect(() => new FFmpegOption('ss', [2545])).to.throw();
    });

    describe('with filters', function () {
      this.beforeEach(() => {
        nodes = [
          new FilterNode('crop', ['iw', 'ih/2', 0, 0]),
          new FilterNode('vflip'),
          new FilterNode('split', [], { outputsCount: 2 })
        ];
        fc = new FilterChain(nodes);
        fg = new FilterGraph();
        fg.addFilterChain(fc);
      });

      it('handles all filter options as filter_complex with GLOBAL context', function () {
        let fo;
        FFmpegOption.FFmpegFilterOptions.forEach((opt) => {
          fo = new FFmpegOption(opt, fg);
          expect(fo.optionName).to.eql('-filter_complex');
        });
      });
    });
  });

  describe('toCommandArray()', function () {
    it('generates the correct command array segment for a global option', function () {
      const o = new FFmpegOption('y');
      const expected = ['-y'];
      expect(o.toCommandArray()).to.deep.eql(expected);
    });
    it('generates the correct command array segment for an input option', function () {
      const options = [
        new FFmpegOption('bitexact'),
        new FFmpegOption('ss', '5110.77')
      ];
      const expected = [['-bitexact'], ['-ss', '5110.77']];
      for (let i = 0; i < options.length; i++) {
        expect(options[i].toCommandArray()).to.deep.eql(expected[i]);
      }
    });
    it('generates the correct command array segment for an output option', function () {
      const options = [
        new FFmpegOption('dn'),
        new FFmpegOption('f', 'mp4')
      ];
      const expected = [['-dn'], ['-f', 'mp4']];
      for (let i = 0; i < options.length; i++) {
        expect(options[i].toCommandArray()).to.deep.eql(expected[i]);
      }
    });
    it('stringifies non-string option values', function () {
      const options = [
        new FFmpegOption('coder', 0),
        new FFmpegOption('subq', 3),
        new FFmpegOption('map_metadata', -1),
        new FFmpegOption('map_chapters', -1)
      ];
      const expected = [
        ['-coder', '0'],
        ['-subq', '3'],
        ['-map_metadata', '-1'],
        ['-map_chapters', '-1']
      ];
      for (let i = 0; i < options.length; i++) {
        expect(options[i].toCommandArray()).to.deep.eql(expected[i]);
      }
    });
    describe('with filters', function () {
      this.beforeEach(() => {
        cropFilter = new FilterNode('crop', ['iw', 'ih/2', 0, 0])
        splitFilter = new FilterNode('split')
        vflipFilter1 = new FilterNode('vflip')
        vflipFilter2 = new FilterNode('vflip')
        const fc1 = new FilterChain([
          cropFilter,
          splitFilter
        ])
        const fc2 = new FilterChain([vflipFilter1])
        fc2.addInputs([ fc1.streamSpecifier(0) ])
        const fc3 = new FilterChain([vflipFilter2])
        fc3.addInputs([ fc1.streamSpecifier(1) ])
        fg = new FilterGraph();
        fg.addFilterChain(fc1);
        fg.addFilterChain(fc2);
        fg.addFilterChain(fc3);
      });

      it('generates the correct command array segment for an output filter option', function () {
        // create FilterGraph object
        const option = new FFmpegOption(
          'filter',
          fg
        );
        const expected = ['-filter_complex', `crop=iw:ih/2:0:0,split[chain0_split_0][chain0_split_1];[chain0_split_0]vflip;[chain0_split_1]vflip`];
        expect(option.toCommandArray()).to.deep.eql(expected);
      });
    });
  });

  describe('toCommandString()', function () {
    it('generates the correct command string segment for a global option', function () {
      const o = new FFmpegOption('y');
      const expected = '-y';
      expect(o.toCommandString()).to.eql(expected);
    });
    it('generates the correct command array segment for an input option', function () {
      const options = [
        new FFmpegOption('bitexact'),
        new FFmpegOption('ss', '5110.77')
      ];
      const expected = ['-bitexact', '-ss 5110.77'];
      for (let i = 0; i < options.length; i++) {
        expect(options[i].toCommandString()).to.eql(expected[i]);
      }
    });
    it('generates the correct command array segment for an output option', function () {
      const options = [
        new FFmpegOption('dn'),
        new FFmpegOption('f', 'mp4')
      ];
      const expected = ['-dn', '-f mp4'];
      for (let i = 0; i < options.length; i++) {
        expect(options[i].toCommandString()).to.deep.eql(expected[i]);
      }
    });
    describe('with filters', function () {
      this.beforeEach(() => {
        cropFilter = new FilterNode('crop', ['iw', 'ih/2', 0, 0])
        splitFilter = new FilterNode('split')
        vflipFilter1 = new FilterNode('vflip')
        vflipFilter2 = new FilterNode('vflip')
        const fc1 = new FilterChain([
          cropFilter,
          splitFilter
        ])
        const fc2 = new FilterChain([vflipFilter1])
        fc2.addInputs([ fc1.streamSpecifier(0) ])
        const fc3 = new FilterChain([vflipFilter2])
        fc3.addInputs([ fc1.streamSpecifier(1) ])
        fg = new FilterGraph();
        fg.addFilterChain(fc1);
        fg.addFilterChain(fc2);
        fg.addFilterChain(fc3);
      });

      it('generates the correct command array segment for an output filter option', function () {
        // create FilterGraph object
        const option = new FFmpegOption('filter', fg);
        const expected = `-filter_complex crop=iw:ih/2:0:0,split[chain0_split_0][chain0_split_1];[chain0_split_0]vflip;[chain0_split_1]vflip`;
        expect(option.toCommandString()).to.deep.eql(expected);
      });
    });
  });
});
