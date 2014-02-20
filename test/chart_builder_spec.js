/*globals define, describe, it*/
define(['chai', 'underscore'], function (chai, _) {
  'use strict';

  //var expect = chai.expect;
  var assert = chai.assert;

  describe('underscore', function() {
    describe('#indexOf()', function () {
      it('should return -1 when value is not present', function(){
        assert.equal(-1, _.indexOf([1,2,3], 5));
        assert.equal(-1, _.indexOf([1,2,3], 0));
      });
    });
  });
});
