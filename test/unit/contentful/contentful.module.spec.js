'use strict';

describe('Contentful module', function() {

  var module;

  beforeEach(function() {
    // Get module
    module = angular.module('contentful');
  });

  it('should exist', function() {
    expect(module).to.be.ok;
  });

});
