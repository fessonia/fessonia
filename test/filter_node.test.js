const chai = require('chai'),
  expect = chai.expect;

const FilterNode = require('../lib/filter_node');

let testFilter, otherTestFilter, badFilterDef1, badFilterDef2, badFilterDef3;

describe('FilterNode', function () {
  describe('simple FilterNode objects', function () {
    this.beforeAll(() => {
      // [tmp] crop=iw:ih/2:0:0 [cropped]
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
          toStringResult: '[tmp] crop=iw:ih/2:0:0 [cropped]'
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
          toStringResult: '[cropped] vflip [flip]'
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
    });
    it('allows setting the previous node', function () {
      let f1 = new FilterNode(testFilter.alias, testFilter.options);
      let f2 = new FilterNode(otherTestFilter.alias, otherTestFilter.options);
      f1.previousNode = f2;
      expect(f1.previousNode).to.eql(f2);
      expect(f2.nextNode).to.eql(f1);
    });
    it('allows setting the next node', function () {
      let f1 = new FilterNode(testFilter.alias, testFilter.options);
      let f2 = new FilterNode(otherTestFilter.alias, otherTestFilter.options);
      f1.nextNode = f2;
      expect(f1.nextNode).to.eql(f2);
      expect(f2.previousNode).to.eql(f1);
    });
    it('generates the correct command array', function () {
      let f1 = new FilterNode(testFilter.alias, testFilter.options);
      expect(f1.toCommandArray()).to.deep.eql(testFilter.expectation.toCommandArrayResult);
      let f2 = new FilterNode(otherTestFilter.alias, otherTestFilter.options);
      expect(f2.toCommandArray()).to.deep.eql(otherTestFilter.expectation.toCommandArrayResult);
    });
    it('generates the correct command string', function () {
      let f1 = new FilterNode(testFilter.alias, testFilter.options);
      expect(f1.toString()).to.deep.eql(testFilter.expectation.toStringResult);
      let f2 = new FilterNode(otherTestFilter.alias, otherTestFilter.options);
      expect(f2.toString()).to.deep.eql(otherTestFilter.expectation.toStringResult);
    });
  });
});
