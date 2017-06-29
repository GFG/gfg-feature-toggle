/* global before, after, beforeEach, afterEach */

'use strict';

// import sinon from 'sinon';
// import manofletters from 'gfg-nodejs-libary-manofletters';
import { ExtendableError } from './index';

const expect = require('chai').expect;


describe('error library', () => {
  describe('index', () => {
    it('should set default error name and status code for ExtendableError class extends with no constructor params', (done) => {
      class ErrorDefaultTest extends ExtendableError {}
      const err = new ErrorDefaultTest();

      expect(err.status).to.equal(500);
      expect(err.name).to.equal('ErrorUnknown');
      done();
    });
  });
});
