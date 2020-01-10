const chai = require('chai'),
  expect = chai.expect,
  fs = require('fs'),
  sinon = require('sinon');

const FilterNode = require('../lib/filter_node');

describe('FilterNode', function () {
  let filterName, filterArgs;
  beforeEach(() => {
    filterName = 'yadif';
    filterArgs = { parity: 'tff' };
  });

  it('sets the filter name', function () {
    let f = new FilterNode(filterName);
    expect(f.filterName).to.deep.eql(filterName);
  });
  it('sets the filter args', function () {
    let f = new FilterNode(filterName, { parity: 'tff' });
    expect(f.args).to.deep.eql(filterArgs);
  });
  it('creates a unique pad prefix', function () {
    let f1 = new FilterNode(filterName, filterArgs);
    expect(f1.padPrefix).to.be.a('string');
  });
  // array-only arguments
  it('generates the correct arguments string representation for array-only arguments', function () {
    let f1 = new FilterNode('scale', [1920, 1080]);
    expect(f1.toString()).to.eql('scale=1920:1080');
  });
  // array-valued arguments
  it('generates the correct arguments string representation for array-valued arguments', function () {
    let f = new FilterNode('aecho', [0.8, 0.9, [1000, 1800], [0.3, 0.25]]);
    expect(f.toString()).to.deep.eql('aecho=0.8:0.9:1000|1800:0.3|0.25');
  });
  // mixed arguments
  it('generates the correct arguments string representation for mixed arguments', function () {
    let f = new FilterNode('crop', [{ x: 12, y: 34 }, 100, 100 ]);
    expect(f.toString()).to.deep.eql('crop=100:100:x=12:y=34');
  });
});
