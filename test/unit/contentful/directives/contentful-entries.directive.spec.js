'use strict';

describe('contentfulEntries directive', function () {

  var contentfulProvider;
  var $httpBackend;
  var $compile;
  var $rootScope;
  var customOptions = {
    space: 'dummySpace',
    accessToken: 'dummyAccessToken',
    secure: true
  };

  // Expected host to check against when using custom options above
  var expectedHost = 'https://cdn.contentful.com:443';

  beforeEach(function () {

    // Define a fake module so we can configure the provider
    // before injecting the service
    var fakeModule = angular.module('fakeModule', function () {
    });
    fakeModule.config(function (_contentfulProvider_) {
      contentfulProvider = _contentfulProvider_;
      contentfulProvider.setOptions(customOptions);
    });

    // Load the module
    module('contentful', 'fakeModule');

    // Instantiate the service
    inject(function (_$httpBackend_, _$compile_, _$rootScope_) {
      $httpBackend = _$httpBackend_;
      $compile = _$compile_;
      $rootScope = _$rootScope_;
    });

  });

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should perform a request to the correct API endpoint when no query is passed', function () {

    var markup = '<div contentful-entries><div>';

    $httpBackend
      .expectGET(expectedHost + '/spaces/dummySpace/entries?access_token=dummyAccessToken&query=')
      .respond(200, '');

    var element = $compile(markup)($rootScope);
    $rootScope.$digest();
    $httpBackend.flush();
  });

  it('should perform a request to the correct API endpoint when query is passed', function () {

    var query = 'customQuery';
    var markup = '<div contentful-entries="' + query + '">{{$contentfulEntries.entries}}<div>';

    $httpBackend
      .expectGET(expectedHost + '/spaces/dummySpace/entries?access_token=dummyAccessToken&query=' + query)
      .respond(200, 'fake-response');

    var element = $compile(markup)($rootScope);
    $rootScope.$digest();
    $httpBackend.flush();
  });

  it('should make the entry available as $contentfulEntries.entry', function () {

    var query = 'customQuery';
    var markup = '<div contentful-entries="' + query + '">{{$contentfulEntries.entries}}<div>';

    $httpBackend
      .expectGET(expectedHost + '/spaces/dummySpace/entries?access_token=dummyAccessToken&query=' + query)
      .respond(200, 'fake-response');

    var element = $compile(markup)($rootScope);
    $rootScope.$digest();
    $httpBackend.flush();

    expect(element.html()).to.contain('fake-response');
  });

});
