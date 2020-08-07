const chai = require('chai'),
  expect = chai.expect;

const { createCommandString } = require('../lib/util/command_string_creator');

describe('command_string_creator', function () {
  describe('createCommandString', function () {
    let cmd, args;
    beforeEach(() => {
      cmd = 'some_command';
      args = ['-abc', '-def', 'ghi', '-jk', '-12', '-lmn', '0'];
    });

    it('should return a string', () => {
      expect(createCommandString(cmd, args)).to.be.a('string');
    });
    it('should return a string of properly quoted args', () => {
      const expected = '-abc -def "ghi" -jk "-12" -lmn "0"';
      expect(createCommandString(null, args)).to.eql(expected);
    });
    it('should start with the command if present', () => {
      const expected = 'some_command -abc -def "ghi" -jk "-12" -lmn "0"';
      expect(createCommandString(cmd, args)).to.eql(expected);
    });
    it('should escape quotes within arguments as needed', () => {
      const argsWithQuotes = ['-some', '-arg', 'with "quotes" inside the value'];
      const expected = '-some -arg "with \\"quotes\\" inside the value"';
      expect(createCommandString(undefined, argsWithQuotes)).to.eql(expected);
    });
  });
});
