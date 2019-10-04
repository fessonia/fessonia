const chai = require('chai'),
  expect = chai.expect,
  fs = require('fs'),
  sinon = require('sinon');

const FilterNode = require('../lib/filter_node');
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
        filterName: 'crop',
        args: ['iw', 'ih/2', 0, 0],
        options: undefined,
        expectation: {
          toStringResult: 'crop=iw:ih/2:0:0',
          filterIOType: FilterNode.FilterIOTypes.GENERIC
        }
      };
      // vflip filter
      otherTestFilter = {
        filterName: 'vflip',
        args: undefined,
        options: undefined,
        expectation: {
          toStringResult: 'vflip',
          filterIOType: FilterNode.FilterIOTypes.GENERIC
        }
      };
      // array args
      arrayArgsFilter = {
        filterName: 'aecho',
        args: [0.8, 0.9, [1000, 1800], [0.3, 0.25]],
        options: undefined,
        expectation: {
          toStringResult: 'aecho=0.8:0.9:1000|1800:0.3|0.25'
        }
      };
      // keyword args
      keywordArgsFilter = {
        filterName: 'crop',
        args: {
          w: 100,
          h: 100,
          x: 12,
          y: 34
        },
        options: undefined,
        expectation: {
          toStringResult: 'crop=w=100:h=100:x=12:y=34'
        }
      };
      // mixed args (this is horrible - don't do this - but we test anyway)
      mixedArgsFilter = {
        filterName: 'crop',
        args: [{ x: 12, y: 34 }, 100, 100 ],
        options: undefined,
        inputs: [{ alias: 'tmp'}],
        outputs: [{ alias: 'cropped'}],
        expectation: {
          toStringResult: 'crop=100:100:x=12:y=34'
        }
      };
      // filter command: COMPLEX
      complexFilter = {
        filterName: 'split',
        args: undefined,
        options: {
          outputsCount: 2
        },
        expectation: {
          filterIOType: FilterNode.FilterIOTypes.GENERIC
        }
      };
      // filter type: SOURCE
      sourceFilter = {
        filterName: 'sine',
        args: undefined,
        options: undefined,
        expectation: {
          filterIOType: FilterNode.FilterIOTypes.SOURCE
        }
      };
      // filter type: SINK
      sinkFilter = {
        filterName: 'nullsink',
        args: undefined,
        options: undefined,
        expectation: {
          filterIOType: FilterNode.FilterIOTypes.SINK
        }
      };
      // variable input filter
      varInputFilter = {
        filterName: 'amerge',
        args: undefined,
        options: {
          inputsCount: 5
        },
        expectation: {
          inputs: ['N', 'N', 'N', 'N', 'N']
        }
      };
      // variable input filter
      varOutputFilter = {
        filterName: 'asplit',
        args: undefined,
        options: {
          outputsCount: 4
        },
        expectation: {
          outputs: ['N', 'N', 'N', 'N']
        }
      };
      // no filterName
      badFilterDef1 = {
        filterName: undefined,
        args: [],
        options: {}
      };
      // invalid inputsCount
      badFilterDef2 = {
        filterName: 'sine',
        args: undefined,
        options: {
          inputsCount: 2
        }
      };
      // invalid outputsCount
      badFilterDef3 = {
        filterName: 'nullsink',
        args: undefined,
        options: {
          outputsCount: 1
        }
      };
      // invalid arguments syntax
      badFilterDef4 = {
        filterName: 'crop',
        args: [ undefined, 3, null ],
        options: undefined
      };
      // unrecognized filterName
      badFilterDef5 = {
        filterName: 'asldfa3tgj23dghsdg',
        args: [],
        options: {}
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

    it('sets the filter name', function () {
      let f = new FilterNode(testFilter.filterName, testFilter.args, testFilter.options);
      expect(f.filterName).to.deep.eql(testFilter.filterName);
    });
    it('sets the filter args', function () {
      let f = new FilterNode(testFilter.filterName, testFilter.args, testFilter.options);
      expect(f.args).to.deep.eql(testFilter.args);
    });
    it('sets the filter options', function () {
      let f = new FilterNode(testFilter.filterName, testFilter.args, testFilter.options);
      expect(f.options).to.deep.eql({});
    });
    it('validates the options object', function () {
      expect(() => new FilterNode(badFilterDef1.filterName, badFilterDef1.args, badFilterDef1.options)).to.throw();
      expect(() => new FilterNode(badFilterDef2.filterName, badFilterDef2.args, badFilterDef2.options)).to.throw();
      expect(() => new FilterNode(badFilterDef3.filterName, badFilterDef3.args, badFilterDef3.options)).to.throw();
      expect(() => new FilterNode(badFilterDef4.filterName, badFilterDef4.args, badFilterDef4.options)).to.throw();

      /*
      // TODO: Figure out how to stub this properly.
      const stubbedLogger = require('../lib/util/logger')('FilterNode(stubbed-logger)');
      stubbedLogger.warn = sinon.spy();
      sinon.stub(FilterNode, 'logger').returns(stubbedLogger);
      new FilterNode(badFilterDef5.filterName, badFilterDef5.args, badFilterDef5.options);
      expect(stubbedLogger.warn.calledOnce()).to.be.true();
      */
    });
    it('sets the appropriate filter type', function () {
      let f1 = new FilterNode(sourceFilter.filterName, sourceFilter.args, sourceFilter.options);
      expect(f1.filterIOType).to.eql(sourceFilter.expectation.filterIOType);
      let f2 = new FilterNode(sinkFilter.filterName, sinkFilter.args, sinkFilter.options);
      expect(f2.filterIOType).to.eql(sinkFilter.expectation.filterIOType);
    });
    it('creates a unique pad prefix', function () {
      let f1 = new FilterNode(testFilter.filterName, testFilter.args, testFilter.options);
      expect(f1.padPrefix).to.be.a('string');
      let f2 = new FilterNode(otherTestFilter.filterName, otherTestFilter.args, otherTestFilter.options);
      expect(f2.padPrefix).to.be.a('string');
    });
    it('handles inputs on variable-input filters', function () {
      let f1 = new FilterNode(varInputFilter.filterName, varInputFilter.args, varInputFilter.options);
      expect(f1.inputs).to.deep.eql(varInputFilter.expectation.inputs);
    });
    it('handles outputs on variable-output filters', function () {
      let f1 = new FilterNode(varOutputFilter.filterName, varOutputFilter.args, varOutputFilter.options);
      expect(f1.outputs).to.deep.eql(varOutputFilter.expectation.outputs);
    });
    // array-only arguments
    it('generates the correct arguments string representation for array-only arguments', function () {
      let f1 = new FilterNode(testFilter.filterName, testFilter.args, testFilter.options);
      expect(f1.toString()).to.eql(testFilter.expectation.toStringResult);
      let f2 = new FilterNode(otherTestFilter.filterName, otherTestFilter.args, otherTestFilter.options);
      expect(f2.toString()).to.eql(otherTestFilter.expectation.toStringResult);
    });
    // array-valued arguments
    it('generates the correct arguments string representation for array-valued arguments', function () {
      let f = new FilterNode(arrayArgsFilter.filterName, arrayArgsFilter.args, arrayArgsFilter.options);
      expect(f.toString()).to.deep.eql(arrayArgsFilter.expectation.toStringResult);
    });
    // keyword arguments
    it('generates the correct arguments string representation for keyword arguments', function () {
      let f = new FilterNode(keywordArgsFilter.filterName, keywordArgsFilter.args, keywordArgsFilter.options);
      expect(f.toString()).to.deep.eql(keywordArgsFilter.expectation.toStringResult);
    });
    // mixed arguments
    it('generates the correct arguments string representation for mixed arguments', function () {
      let f = new FilterNode(mixedArgsFilter.filterName, mixedArgsFilter.args, mixedArgsFilter.options);
      expect(f.toString()).to.deep.eql(mixedArgsFilter.expectation.toStringResult);
    });
    it('provides filter validation info based on ffmpeg help output', function () {
      expect(FilterNode._getValidFilterInfoFromFFmpeg()).to.deep.equal(filterInfoFixture);
    });
    // TODO: figure out how to add an un-stubbed test involving ffmpeg for FilterNode._queryFFmpegForFilters that doesn't break Jenkins
  });
});
