const chai = require('chai'),
  expect = chai.expect;

const FilterChain = require('../lib/filter_chain');
const FilterNode = require('../lib/filter_node');

let nodes = [
  new FilterNode('cropFilter', {
      filterName: 'crop',
      inputs: [{ alias: 'tmp' }],
      outputs: [{ alias: 'cropped' }],
      args: ['iw', 'ih/2', 0, 0]
    }
  ),
  new FilterNode('vflipFilter',
    {
      filterName: 'vflip',
      inputs: [{ alias: 'cropped'}],
      outputs: [{ alias: 'flip' }]
    }
  )
];

describe('FilterChain', function () {
  describe('simple FilterChain objects', function () {
    it('creates a FilterChain from a list of FilterNodes', function () {
      const fc = new FilterChain("my_filter_chain", nodes);
      expect(fc instanceof FilterChain).to.be.true;
    });
  });
});

// TODO: test autoConnect true vs false
// TODO: test non-Array values of nodes
// TODO: test invalid elements of nodes Array
