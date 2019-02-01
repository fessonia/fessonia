const chai = require('chai'),
  expect = chai.expect;

module.exports = {
  expectLast: function (tested, expected) {
    const last = tested[tested.length - 1];
    expect(last).to.eql(expected);
  },
  expectSequences: function (tested, sequences) {
    let k, found;
    for (let seq of sequences) {
      k = 0;
      found = -1;
      while (k < tested.length - 1) {
        if (tested[k] === seq[0]) {
          found = k;
          break;
        }
        k += 1;
      }
      if (found >= 0) {
        expect(tested.slice(found, found + seq.length)).to.deep.eql(seq);
      } else {
        expect(false).to.be.true;
      }
    }
  }
};
