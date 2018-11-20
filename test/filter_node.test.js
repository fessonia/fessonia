const chai = require('chai'),
  expect = chai.expect,
  sinon = require('sinon');

const FilterNode = require('../lib/filter_node');

let testFilter, otherTestFilter, arrayArgsFilter, mixedArgsFilter, complexFilter, sourceFilter,
  sinkFilter, badFilterDef1, badFilterDef2, badFilterDef3, badFilterDef4, badFilterDef5;

describe('FilterNode', function () {
  describe('simple FilterNode objects', function () {
    this.beforeAll(() => {
      // basic test filter
      testFilter = {
        alias: 'cropFilter',
        options: {
          filterName: 'crop',
          inputs: [{ alias: 'tmp' }],
          outputs: [{ alias: 'cropped' }],
          args: ['iw', 'ih/2', 0, 0]
        },
        expectation: {
          toCommandArrayResult: ['[tmp]', 'crop=iw:ih/2:0:0', '[cropped]'],
          toCommandStringResult: '[tmp] crop=iw:ih/2:0:0 [cropped]',
          toStringResult: 'FilterNode("cropFilter", "[tmp] crop=iw:ih/2:0:0 [cropped]")',
          filterCommand: FilterNode.FilterCommands.FILTER,
          filterIOType: FilterNode.FilterIOTypes.GENERIC
        }
      };
      // [cropped] vflip [flip]
      otherTestFilter = {
        alias: 'vflipFilter',
        options: {
          filterName: 'vflip',
          inputs: [{ alias: 'cropped'}],
          outputs: [{ alias: 'flip' }]
        },
        expectation: {
          toCommandArrayResult: ['[cropped]', 'vflip', '[flip]'],
          toCommandStringResult: '[cropped] vflip [flip]',
          toStringResult: 'FilterNode("vflipFilter", "[cropped] vflip [flip]")',
          filterCommand: FilterNode.FilterCommands.FILTER,
          filterIOType: FilterNode.FilterIOTypes.GENERIC
        }
      };
      // array args
      arrayArgsFilter = {
        alias: 'aechoFilter',
        options: {
          filterName: 'aecho',
          inputs: [{ alias: 'tmp'}],
          outputs: [{ alias: 'echoed'}],
          args: [0.8, 0.9, [1000, 1800], [0.3, 0.25]]
        },
        expectation: {
          toCommandArrayResult: ['[tmp]', 'aecho=0.8:0.9:1000|1800:0.3|0.25', '[echoed]'],
          toCommandStringResult: '[tmp] aecho=0.8:0.9:1000|1800:0.3|0.25 [echoed]',
          toStringResult: 'FilterNode("aechoFilter", "[tmp] aecho=0.8:0.9:1000|1800:0.3|0.25 [echoed]")'
        }
      };
      // keyword args
      keywordArgsFilter = {
        alias: 'cropKWFilter',
        options: {
          filterName: 'crop',
          inputs: [{ alias: 'tmp'}],
          outputs: [{ alias: 'cropped'}],
          args: [
            { name: 'w', value: 100 },
            { name: 'h', value: 100 },
            { name: 'x', value: 12 },
            { name: 'y', value: 34 }
          ]
        },
        expectation: {
          toCommandArrayResult: ['[tmp]', 'crop=w=100:h=100:x=12:y=34', '[cropped]'],
          toCommandStringResult: '[tmp] crop=w=100:h=100:x=12:y=34 [cropped]',
          toStringResult: 'FilterNode("cropKWFilter", "[tmp] crop=w=100:h=100:x=12:y=34 [cropped]")'
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
          toCommandArrayResult: ['[tmp]', 'crop=100:100:x=12:y=34', '[cropped]'],
          toCommandStringResult: '[tmp] crop=100:100:x=12:y=34 [cropped]',
          toStringResult: 'FilterNode("cropMixedFilter", "[tmp] crop=100:100:x=12:y=34 [cropped]")'
        }
      };
      // filter command: COMPLEX
      complexFilter = {
        alias: 'complexFilter',
        options: {
          filterName: 'split',
          inputs: ['in'],
          outputs: ['main', 'flip']
        },
        expectation: {
          filterCommand: FilterNode.FilterCommands.COMPLEX,
          filterIOType: FilterNode.FilterIOTypes.GENERIC
        }
      };
      // filter type: SOURCE
      sourceFilter = {
        alias: 'complexFilter',
        options: {
          filterName: 'sine',
          inputs: [],
          outputs: ['tone']
        },
        expectation: {
          filterCommand: FilterNode.FilterCommands.FILTER,
          filterIOType: FilterNode.FilterIOTypes.SOURCE
        }
      };
      // filter type: SINK
      sinkFilter = {
        alias: 'sinkFilter',
        options: {
          filterName: 'nullsink',
          inputs: ['main'],
          outputs: []
        },
        expectation: {
          filterCommand: FilterNode.FilterCommands.FILTER,
          filterIOType: FilterNode.FilterIOTypes.SINK
        }
      };
      // no filterName
      badFilterDef1 = {
        alias: 'noFilterName',
        options: {
          inputs: [{ alias: 'tmp' }],
          outputs: [{ alias: 'cropped' }]
        }
      };
      // no inputs or outputs
      badFilterDef2 = {
        alias: 'noInOrOut',
        options: {
          filterName: 'vflip'
        }
      };
      badFilterDef3 = {
        alias: 'noInOrOut',
        options: {
          filterName: 'vflip',
          inputs: [],
          outputs: []
        }
      };
      // invalid arguments syntax
      badFilterDef4 = {
        alias: 'invalidFilterArgs',
        options: {
          filterName: 'crop',
          inputs: [{ alias: 'tmp' }],
          outputs: [{ alias: 'cropped' }],
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
          inputs: [{ alias: 'tmp' }],
          outputs: [{ alias: 'cropped' }],
          args: [ undefined, 3, null ]
        }
      };
      // unrecognized filterName
      badFilterDef6 = {
        alias: 'unknownFilter',
        options: {
          filterName: 'asldfa3tgj23dghsdg'
        }
      };
    });

    it('sets the filter alias and options', function () {
      let f = new FilterNode(testFilter.alias, testFilter.options);
      expect(f.alias).to.eql(testFilter.alias);
      expect(f.options).to.deep.eql(testFilter.options);
    });
    it('validates the options object', function () {
      expect(() => new FilterNode(badFilterDef1.alias, badFilterDef1.options)).to.throw();
      expect(() => new FilterNode(badFilterDef2.alias, badFilterDef2.options)).to.throw();
      expect(() => new FilterNode(badFilterDef3.alias, badFilterDef3.options)).to.throw();
      expect(() => new FilterNode(badFilterDef4.alias, badFilterDef4.options)).to.throw();
      expect(() => new FilterNode(badFilterDef5.alias, badFilterDef5.options)).to.throw();

      sinon.stub(logger, 'warn');
      new FilterNode(badFilterDef6.alias, badFilterDef6.options);
      expect(logger.warn.called).to.be.true;
      logger.warn.restore();
    });
    it.skip('allows setting the previous node', function () {
      let f1 = new FilterNode(testFilter.alias, testFilter.options);
      let f2 = new FilterNode(otherTestFilter.alias, otherTestFilter.options);
      f1.previousNode = f2;
      expect(f1.previousNode).to.eql(f2);
      expect(f2.nextNode).to.eql(f1);
    });
    it.skip('allows setting the next node', function () {
      let f1 = new FilterNode(testFilter.alias, testFilter.options);
      let f2 = new FilterNode(otherTestFilter.alias, otherTestFilter.options);
      f1.nextNode = f2;
      expect(f1.nextNode).to.eql(f2);
      expect(f2.previousNode).to.eql(f1);
    });
    it('sets the appropriate filter command', function () {
      let f = new FilterNode(complexFilter.alias, complexFilter.options);
      expect(f.filterCommand).to.eql(complexFilter.expectation.filterCommand);
    });
    it('sets the appropriate filter type', function () {
      let f1 = new FilterNode(sourceFilter.alias, sourceFilter.options);
      expect(f1.filterIOType).to.eql(sourceFilter.expectation.filterIOType);
      let f2 = new FilterNode(sinkFilter.alias, sinkFilter.options);
      expect(f2.filterIOType).to.eql(sinkFilter.expectation.filterIOType);
    });
    // array-only arguments
    it('generates the correct command array for array-only arguments', function () {
      let f1 = new FilterNode(testFilter.alias, testFilter.options);
      expect(f1.toCommandArray()).to.deep.eql(testFilter.expectation.toCommandArrayResult);
      let f2 = new FilterNode(otherTestFilter.alias, otherTestFilter.options);
      expect(f2.toCommandArray()).to.deep.eql(otherTestFilter.expectation.toCommandArrayResult);
    });
    it('generates the correct command string for array-only arguments', function () {
      let f1 = new FilterNode(testFilter.alias, testFilter.options);
      expect(f1.toCommandString()).to.deep.eql(testFilter.expectation.toCommandStringResult);
      let f2 = new FilterNode(otherTestFilter.alias, otherTestFilter.options);
      expect(f2.toCommandString()).to.deep.eql(otherTestFilter.expectation.toCommandStringResult);
    });
    it('generates the correct string representation for array-only arguments', function () {
      let f1 = new FilterNode(testFilter.alias, testFilter.options);
      expect(f1.toString()).to.deep.eql(testFilter.expectation.toStringResult);
      let f2 = new FilterNode(otherTestFilter.alias, otherTestFilter.options);
      expect(f2.toString()).to.deep.eql(otherTestFilter.expectation.toStringResult);
    });
    // array-valued arguments
    it('generates the correct command array for array-valued arguments', function () {
      let f = new FilterNode(arrayArgsFilter.alias, arrayArgsFilter.options);
      expect(f.toCommandArray()).to.deep.eql(arrayArgsFilter.expectation.toCommandArrayResult);
    });
    it('generates the correct command string for array-valued arguments', function () {
      let f = new FilterNode(arrayArgsFilter.alias, arrayArgsFilter.options);
      expect(f.toCommandString()).to.deep.eql(arrayArgsFilter.expectation.toCommandStringResult);
    });
    it('generates the correct string representation for array-valued arguments', function () {
      let f = new FilterNode(arrayArgsFilter.alias, arrayArgsFilter.options);
      expect(f.toString()).to.deep.eql(arrayArgsFilter.expectation.toStringResult);
    });
    // keyword arguments
    it('generates the correct command array for keyword arguments', function () {
      let f = new FilterNode(keywordArgsFilter.alias, keywordArgsFilter.options);
      expect(f.toCommandArray()).to.deep.eql(keywordArgsFilter.expectation.toCommandArrayResult);
    });
    it('generates the correct command string for keyword arguments', function () {
      let f = new FilterNode(keywordArgsFilter.alias, keywordArgsFilter.options);
      expect(f.toCommandString()).to.deep.eql(keywordArgsFilter.expectation.toCommandStringResult);
    });
    it('generates the correct string representation for keyword arguments', function () {
      let f = new FilterNode(keywordArgsFilter.alias, keywordArgsFilter.options);
      expect(f.toString()).to.deep.eql(keywordArgsFilter.expectation.toStringResult);
    });
    // mixed arguments
    it('generates the correct command array for mixed arguments', function () {
      let f = new FilterNode(mixedArgsFilter.alias, mixedArgsFilter.options);
      expect(f.toCommandArray()).to.deep.eql(mixedArgsFilter.expectation.toCommandArrayResult);
    });
    it('generates the correct command string for mixed arguments', function () {
      let f = new FilterNode(mixedArgsFilter.alias, mixedArgsFilter.options);
      expect(f.toCommandString()).to.deep.eql(mixedArgsFilter.expectation.toCommandStringResult);
    });
    it('generates the correct string representation for mixed arguments', function () {
      let f = new FilterNode(mixedArgsFilter.alias, mixedArgsFilter.options);
      expect(f.toString()).to.deep.eql(mixedArgsFilter.expectation.toStringResult);
    });
  });
});
