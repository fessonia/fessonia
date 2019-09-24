const chai = require('chai'),
  expect = chai.expect;

const { Readable } = require('stream');

/**
 * Test readable stream class (for internal use in testing only)
 */
class TestReadableStream extends Readable {
  /**
   * Required _read method of Readable interface. Logging no-op.
   * @returns {void}
   */
  _read () {}
}

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
  },
  createTestReadableStream () { return new TestReadableStream(); }
};
