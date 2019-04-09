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
      // basic test filter
      testFilter = {
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
        options: { filterName: 'vflip' },
        expectation: {
          toStringResult: 'vflip',
          filterIOType: FFmpegEnumerations.FilterIOTypes.GENERIC
        }
      };
      // array args
      arrayArgsFilter = {
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
        options: {
          filterName: 'split'
        },
        expectation: {
          filterIOType: FFmpegEnumerations.FilterIOTypes.GENERIC
        }
      };
      // filter type: SOURCE
      sourceFilter = {
        options: {
          filterName: 'sine'
        },
        expectation: {
          filterIOType: FFmpegEnumerations.FilterIOTypes.SOURCE
        }
      };
      // filter type: SINK
      sinkFilter = {
        options: {
          filterName: 'nullsink'
        },
        expectation: {
          filterIOType: FFmpegEnumerations.FilterIOTypes.SINK
        }
      };
      // variable input filter
      varInputFilter = {
        options: {
          filterName: 'amerge',
          inputsCount: 5
        },
        expectation: {
          inputs: ['N', 'N', 'N', 'N', 'N']
        }
      };
      // variable input filter
      varOutputFilter = {
        options: {
          filterName: 'asplit',
          outputsCount: 4
        },
        expectation: {
          outputs: ['N', 'N', 'N', 'N']
        }
      };
      // no filterName
      badFilterDef1 = {
        options: {}
      };
      // invalid inputsCount
      badFilterDef2 = {
        options: {
          filterName: 'sine',
          inputsCount: 2
        }
      };
      // invalid outputsCount
      badFilterDef3 = {
        options: {
          filterName: 'nullsink',
          outputsCount: 1
        }
      };
      // invalid arguments syntax
      badFilterDef4 = {
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
        options: {
          filterName: 'crop',
          args: [ undefined, 3, null ]
        }
      };
      // unrecognized filterName
      badFilterDef6 = {
        options: { filterName: 'asldfa3tgj23dghsdg' }
      };
    });

    this.afterAll(() => {
    });

    this.beforeEach(() => {
      // stub for ffmpeg interaction
      sinon.stub(FilterNode, '_queryFFmpegForFilters')
        .returns(filtersFixture);
    });

    this.afterEach(() => {
      // restore sinon sandbox
      sinon.restore();
    });

    it('sets the filter options', function () {
      let f = new FilterNode(testFilter.options);
      expect(f.options).to.deep.eql(testFilter.options);
    });
    it('validates the options object', function () {
      expect(() => new FilterNode(badFilterDef1.options)).to.throw();
      expect(() => new FilterNode(badFilterDef2.options)).to.throw();
      expect(() => new FilterNode(badFilterDef3.options)).to.throw();
      expect(() => new FilterNode(badFilterDef4.options)).to.throw();
      expect(() => new FilterNode(badFilterDef5.options)).to.throw();

      /*
      // TODO: Figure out how to stub this properly.
      const stubbedLogger = require('../lib/util/logger')('FilterNode(stubbed-logger)');
      stubbedLogger.warn = sinon.spy();
      sinon.stub(FilterNode, 'logger').returns(stubbedLogger);
      new FilterNode(badFilterDef6.options);
      expect(stubbedLogger.warn.calledOnce()).to.be.true();
      */
    });
    it('sets the appropriate filter type', function () {
      let f1 = new FilterNode(sourceFilter.options);
      expect(f1.filterIOType).to.eql(sourceFilter.expectation.filterIOType);
      let f2 = new FilterNode(sinkFilter.options);
      expect(f2.filterIOType).to.eql(sinkFilter.expectation.filterIOType);
    });
    it('creates a unique pad prefix', function () {
      let f1 = new FilterNode(testFilter.options);
      expect(f1.padPrefix).to.be.a('string');
      let f2 = new FilterNode(otherTestFilter.options);
      expect(f2.padPrefix).to.be.a('string');
    });
    it('handles inputs on variable-input filters', function () {
      let f1 = new FilterNode(varInputFilter.options);
      expect(f1.inputs).to.deep.eql(varInputFilter.expectation.inputs);
    });
    it('handles outputs on variable-output filters', function () {
      let f1 = new FilterNode(varOutputFilter.options);
      expect(f1.outputs).to.deep.eql(varOutputFilter.expectation.outputs);
    });
    // array-only arguments
    it('generates the correct arguments string representation for array-only arguments', function () {
      let f1 = new FilterNode(testFilter.options);
      expect(f1.toString()).to.eql(testFilter.expectation.toStringResult);
      let f2 = new FilterNode(otherTestFilter.options);
      expect(f2.toString()).to.eql(otherTestFilter.expectation.toStringResult);
    });
    // array-valued arguments
    it('generates the correct arguments string representation for array-valued arguments', function () {
      let f = new FilterNode(arrayArgsFilter.options);
      expect(f.toString()).to.deep.eql(arrayArgsFilter.expectation.toStringResult);
    });
    // keyword arguments
    it('generates the correct arguments string representation for keyword arguments', function () {
      let f = new FilterNode(keywordArgsFilter.options);
      expect(f.toString()).to.deep.eql(keywordArgsFilter.expectation.toStringResult);
    });
    // mixed arguments
    it('generates the correct arguments string representation for mixed arguments', function () {
      let f = new FilterNode(mixedArgsFilter.options);
      expect(f.toString()).to.deep.eql(mixedArgsFilter.expectation.toStringResult);
    });
    it('provides filter validation info based on ffmpeg help output', function () {
      expect(FilterNode._getValidFilterInfoFromFFmpeg()).to.deep.equal(filterInfoFixture);
    });
    // TODO: figure out how to add an un-stubbed test involving ffmpeg for FilterNode._queryFFmpegForFilters that doesn't break Jenkins
  });
});
