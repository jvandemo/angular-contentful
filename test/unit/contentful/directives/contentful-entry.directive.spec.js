'use strict';

describe('contentfulEntry directive', function () {

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

  it('should perform a request to the correct API endpoint', function () {

    var id = 'customId';
    var markup = '<div contentful-entry="' + id + '">{{$contentfulEntry.entry}}<div>';

    $httpBackend
      .expectGET(expectedHost + '/spaces/dummySpace/entries/' + id + '?access_token=dummyAccessToken')
      .respond(200, 'fake-response');

    var element = $compile(markup)($rootScope);
    $rootScope.$digest();
    $httpBackend.flush();
  });

  it('should make the entry available as $contentfulEntry.entry', function () {

    var id = 'customId';
    var markup = '<div contentful-entry="' + id + '">{{$contentfulEntry.entry}}<div>';

    $httpBackend
      .expectGET(expectedHost + '/spaces/dummySpace/entries/' + id + '?access_token=dummyAccessToken')
      .respond(200, 'fake-response');

    var element = $compile(markup)($rootScope);
    $rootScope.$digest();
    $httpBackend.flush();

    expect(element.html()).to.contain('fake-response');
  });

});
