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

  var sampleResponse = {
    items: [
      {
        someValue: 'wow',
        someLink: {sys: {type: 'Link', linkType: 'Entry', id: 'suchId'}}
      }
    ],
    includes: {
      Entry: [
        {sys: {type: 'Entry', id: 'suchId'}, very: 'doge'}
      ]
    }
  };

  var expectedOutcome = [
    {
      // Value stays the same
      someValue: 'wow',

      // Link gets replaced by the actual object from `includes.Entry`
      someLink: {sys: {type: 'Entry', id: 'suchId'}, very: 'doge'}
    }
  ];

  // Expected host to check against when using custom options above
  var expectedHost = 'https://cdn.contentful.com:443';

  beforeEach(function () {

    // Define a fake module so we can configure the provider
    // before injecting the service
    var fakeModule = angular.module('fakeModule', []);
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

  it('should perform a request to the correct API endpoint when no query string is passed', function () {

    var markup = '<div contentful-entries><div>';

    $httpBackend
      .expectGET(expectedHost + '/spaces/dummySpace/entries?access_token=dummyAccessToken')
      .respond(200, '');

    var element = $compile(markup)($rootScope);
    $rootScope.$digest();
    $httpBackend.flush();
  });

  it('should perform a request to the correct API endpoint when invalid query string is passed', function () {

    var queryString = 'customQuery';
    var markup = '<div contentful-entries="\'' + queryString + '\'">{{$contentfulEntries}}<div>';

    $httpBackend
      .expectGET(expectedHost + '/spaces/dummySpace/entries?access_token=dummyAccessToken')
      .respond(200, 'fake-response');

    var element = $compile(markup)($rootScope);
    $rootScope.$digest();
    $httpBackend.flush();
  });

  it('should perform a request to the correct API endpoint when valid query string is passed', function () {

    var queryString = 'query=test';
    var markup = '<div contentful-entries="\'' + queryString + '\'">{{$contentfulEntries}}<div>';

    $httpBackend
      .expectGET(expectedHost + '/spaces/dummySpace/entries?access_token=dummyAccessToken&query=test')
      .respond(200, 'fake-response');

    var element = $compile(markup)($rootScope);
    $rootScope.$digest();
    $httpBackend.flush();
  });

  it('should perform a request to the correct API endpoint when an expression is passed', function () {

    var queryString = 'query=test';
    var $scope = $rootScope.$new();
    $scope.query = queryString;
    var markup = '<div contentful-entries="query">{{$contentfulEntries}}<div>';

    $httpBackend
      .expectGET(expectedHost + '/spaces/dummySpace/entries?access_token=dummyAccessToken&query=test')
      .respond(200, 'fake-response');

    var element = $compile(markup)($scope);
    $rootScope.$digest();
    $httpBackend.flush();
  });

  it('should make the entries available as $contentfulEntries', function () {

    var markup = '<div contentful-entries>{{$contentfulEntries}}<div>';

    $httpBackend
      .expectGET(expectedHost + '/spaces/dummySpace/entries?access_token=dummyAccessToken')
      .respond(200, sampleResponse);

    var element = $compile(markup)($rootScope);
    $rootScope.$digest();
    $httpBackend.flush();

    expect(element.html()).to.contain(JSON.stringify(expectedOutcome));
  });

});
