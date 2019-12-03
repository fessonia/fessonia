const sinon = require('sinon');
const chai = require('chai'),
  chaiAlmost = require('chai-almost');
chai.use(chaiAlmost(10e-9));

afterEach(() => sinon.restore());
