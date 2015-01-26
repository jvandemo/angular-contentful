'use strict';

describe('Contentful service', function () {

  var contentful;
  var contentfulProvider;
  var customOptions = {
    space: 'customSpaceId',
    accessToken: 'customAccessToken',
    secure: true
  };

  beforeEach(function(){

    // Define a fake module so we can configure the provider
    // before injecting the service
    var fakeModule = angular.module('fakeModule', function(){});
    fakeModule.config( function (_contentfulProvider_) {
      contentfulProvider = _contentfulProvider_;
      contentfulProvider.setOptions(customOptions);
    });

    // Load the module
    module('contentful', 'fakeModule');

    // Instantiate the service
    inject(function (_contentful_) {
      contentful = _contentful_;
    });
  });

  describe('provider', function(){

    it('should exist', function () {
      expect(contentfulProvider).to.be.an('object');
    });

    describe('#setOptions', function(){

      it('should be a function', function () {
        expect(contentfulProvider.setOptions).to.be.a('function');
      });

    });

  });

  describe('instance', function(){

    it('should have an options property', function () {
      expect(contentful.options).to.be.an('object');
    });

    it('should have custom options passed to provider using setOptions()', function () {
      expect(contentful.options.space).to.equal(customOptions.space);
      expect(contentful.options.accessToken).to.equal(customOptions.accessToken);
      expect(contentful.options.secure).to.equal(customOptions.secure);
    });

  });




});
