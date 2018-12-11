const chai = require('chai'),
  expect = chai.expect,
  fs = require('fs'),
  sinon = require('sinon');

const FilterNode = require('../lib/filter_node'),
  FFmpegEnumerations = require('../lib/ffmpeg_enumerations');
const filtersFixture = fs.readFileSync(`${__dirname}/fixtures/ffmpeg-filters.out`).toString();
const filterInfoFixture = JSON.parse(
  fs.readFileSync(`${__dirname}/fixtures/ffmpeg-filters.json`).toString()
);

let testFilter, otherTestFilter, arrayArgsFilter, mixedArgsFilter, complexFilter, sourceFilter,
  sinkFilter, badFilterDef1, badFilterDef2, badFilterDef3, badFilterDef4, badFilterDef5;

describe('FilterNode', function () {
  describe('simple FilterNode objects', function () {
    this.beforeAll(() => {
      // stub for ffmpeg interaction
      sinon.stub(FilterNode, '_queryFFmpegForFilters')
        .returns(filtersFixture);
      // basic test filter
      testFilter = {
        alias: 'cropFilter',
        options: {
          filterName: 'crop',
          args: ['iw', 'ih/2', 0, 0]
        },
        expectation: {
          toStringResult: 'crop=iw:ih/2:0:0',
          filterIOType: FFmpegEnumerations.FilterIOTypes.GENERIC
        }
      };
      // vflip filter
      otherTestFilter = {
        alias: 'vflipFilter',
        options: { filterName: 'vflip' },
        expectation: {
          toStringResult: 'vflip',
          filterIOType: FFmpegEnumerations.FilterIOTypes.GENERIC
        }
      };
      // array args
      arrayArgsFilter = {
        alias: 'aechoFilter',
        options: {
          filterName: 'aecho',
          args: [0.8, 0.9, [1000, 1800], [0.3, 0.25]]
        },
        expectation: {
          toStringResult: 'aecho=0.8:0.9:1000|1800:0.3|0.25'
        }
      };
      // keyword args
      keywordArgsFilter = {
        alias: 'cropKWFilter',
        options: {
          filterName: 'crop',
          args: [
            { name: 'w', value: 100 },
            { name: 'h', value: 100 },
            { name: 'x', value: 12 },
            { name: 'y', value: 34 }
          ]
        },
        expectation: {
          toStringResult: 'crop=w=100:h=100:x=12:y=34'
        }
      };
      // mixed args (this is horrible - don't do this - but we test anyway)
      mixedArgsFilter = {
        alias: 'cropMixedFilter',
        options: {
          filterName: 'crop',
          inputs: [{ alias: 'tmp'}],
          outputs: [{ alias: 'cropped'}],
          args: [ { name: 'x', value: 12 }, { name: 'y', value: 34 }, 100, 100 ]
        },
        expectation: {
          toStringResult: 'crop=100:100:x=12:y=34'
        }
      };
      // filter command: COMPLEX
      complexFilter = {
        alias: 'complexFilter',
        options: {
          filterName: 'split'
        },
        expectation: {
          filterIOType: FFmpegEnumerations.FilterIOTypes.GENERIC
        }
      };
      // filter type: SOURCE
      sourceFilter = {
        alias: 'complexFilter',
        options: {
          filterName: 'sine'
        },
        expectation: {
          filterIOType: FFmpegEnumerations.FilterIOTypes.SOURCE
        }
      };
      // filter type: SINK
      sinkFilter = {
        alias: 'sinkFilter',
        options: {
          filterName: 'nullsink'
        },
        expectation: {
          filterIOType: FFmpegEnumerations.FilterIOTypes.SINK
        }
      };
      // no filterName
      badFilterDef1 = {
        alias: 'noFilterName',
        options: {}
      };
      // invalid arguments syntax
      badFilterDef4 = {
        alias: 'invalidFilterArgs',
        options: {
          filterName: 'crop',
          args: [
            { title: 'x', val: 12 },
            { title: 'y', val: 34 },
            { title: 'w', val: 100 },
            { title: 'h', val: 100 }
          ]
        }
      };
      badFilterDef5 = {
        alias: 'invalidFilterArgs',
        options: {
          filterName: 'crop',
          args: [ undefined, 3, null ]
        }
      };
      // unrecognized filterName
      badFilterDef6 = {
        alias: 'unknownFilter',
        options: { filterName: 'asldfa3tgj23dghsdg' }
      };
    });

    this.afterAll(() => {
      FilterNode._queryFFmpegForFilters.restore();
    });

    it('sets the filter alias and options', function () {
      let f = new FilterNode(testFilter.alias, testFilter.options);
      expect(f.alias).to.eql(testFilter.alias);
      expect(f.options).to.deep.eql(testFilter.options);
    });
    it('validates the options object', function () {
      expect(() => new FilterNode(badFilterDef1.alias, badFilterDef1.options)).to.throw();
      expect(() => new FilterNode(badFilterDef4.alias, badFilterDef4.options)).to.throw();
      expect(() => new FilterNode(badFilterDef5.alias, badFilterDef5.options)).to.throw();

      sinon.stub(logger, 'warn');
      new FilterNode(badFilterDef6.alias, badFilterDef6.options);
      expect(logger.warn.called).to.be.true;
      logger.warn.restore();
    });
    it('sets the appropriate filter type', function () {
      let f1 = new FilterNode(sourceFilter.alias, sourceFilter.options);
      expect(f1.filterIOType).to.eql(sourceFilter.expectation.filterIOType);
      let f2 = new FilterNode(sinkFilter.alias, sinkFilter.options);
      expect(f2.filterIOType).to.eql(sinkFilter.expectation.filterIOType);
    });
    // array-only arguments
    it('generates the correct arguments string representation for array-only arguments', function () {
      let f1 = new FilterNode(testFilter.alias, testFilter.options);
      expect(f1.toString()).to.eql(testFilter.expectation.toStringResult);
      let f2 = new FilterNode(otherTestFilter.alias, otherTestFilter.options);
      expect(f2.toString()).to.eql(otherTestFilter.expectation.toStringResult);
    });
    // array-valued arguments
    it('generates the correct arguments string representation for array-valued arguments', function () {
      let f = new FilterNode(arrayArgsFilter.alias, arrayArgsFilter.options);
      expect(f.toString()).to.deep.eql(arrayArgsFilter.expectation.toStringResult);
    });
    // keyword arguments
    it('generates the correct arguments string representation for keyword arguments', function () {
      let f = new FilterNode(keywordArgsFilter.alias, keywordArgsFilter.options);
      expect(f.toString()).to.deep.eql(keywordArgsFilter.expectation.toStringResult);
    });
    // mixed arguments
    it('generates the correct arguments string representation for mixed arguments', function () {
      let f = new FilterNode(mixedArgsFilter.alias, mixedArgsFilter.options);
      expect(f.toString()).to.deep.eql(mixedArgsFilter.expectation.toStringResult);
    });
    it('provides filter validation info based on ffmpeg help output', function () {
      expect(FilterNode._getValidFilterInfoFromFFmpeg()).to.deep.equal(filterInfoFixture);
    });
    // TODO: figure out how to add an un-stubbed test involving ffmpeg for FilterNode._queryFFmpegForFilters that doesn't break Jenkins
  });
});
