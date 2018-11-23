/* global describe, it */
'use strict';

define(['chai', '../../src/properties'], function (chai, properties) {
  const expect = chai.expect;
  describe('properties', function () {
    it('should return', function () {
      expect(properties).to.have.a.property('type').to.be.equal('items');
      expect(properties).to.have.a.property('component').to.be.equal('accordion');
      expect(properties).to.have.a.property('items');
    });
  });
});
