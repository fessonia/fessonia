const chai = require('chai'),
  expect = chai.expect;

const { Readable } = require('stream');

/* eslint-disable no-console */

/**
 * Test readable stream class (for internal use in testing only)
 */
class TestReadableStream extends Readable {
  /**
   * Constructor
   * @param {Object} opts - options for the Readable stream 
   * 
   * @returns {TestReadableStream} - the object instance
   */
  constructor (opts) {
    super(opts);
    for (let e of ['data', 'close', 'error', 'end']) {
      this.on(e, (data, eventName = e) => console.log(`Event '${eventName}' received on TestReadableStream: event data = ${data}`));
    }
  }
  /**
   * Required _read method of Readable interface. Logging no-op.
   * 
   * @returns {void}
   */
  _read () {
    console.log('TestReadableStream._read() called.');
  }
}

/* eslint-enable no-console */

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
