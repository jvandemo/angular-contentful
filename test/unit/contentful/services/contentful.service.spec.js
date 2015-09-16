'use strict';

describe('Contentful service', function () {

  var contentful;
  var contentfulProvider;
  var $http;
  var $httpBackend;
  var $q;
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
    var fakeModule = angular.module('fakeModule', []);
    fakeModule.config(function (_contentfulProvider_) {
      contentfulProvider = _contentfulProvider_;
      contentfulProvider.setOptions(customOptions);
    });

    // Load the module
    module('contentful', 'fakeModule');

    // Instantiate the service
    inject(function (_$http_, _$q_, _contentful_, _$httpBackend_) {
      $http = _$http_;
      $q = _$q_;
      contentful = _contentful_;
      $httpBackend = _$httpBackend_;
    });

  });

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('provider', function () {

    it('should exist', function () {
      expect(contentfulProvider).to.be.an('object');
    });

    describe('#setOptions', function () {

      it('should be a function', function () {
        expect(contentfulProvider.setOptions).to.be.a('function');
      });

    });

    describe('#setOptions()', function () {

      it('should return the provider', function () {
        expect(contentfulProvider.setOptions()).to.equal(contentfulProvider);
      });

    });

  });

  describe('instance', function () {

    describe('#options', function () {

      it('should be an object', function () {
        expect(contentful.options).to.be.an('object');
      });

      it('should contain custom options passed to provider using setOptions()', function () {
        expect(contentful.options.space).to.equal(customOptions.space);
        expect(contentful.options.accessToken).to.equal(customOptions.accessToken);
        expect(contentful.options.secure).to.equal(customOptions.secure);
      });

    });

    describe('#_$http', function () {

      it('should be an object', function () {
        expect(contentful._$http).to.be.a('function');
      });

      it('should equal $http by default', function () {
        expect(contentful._$http).to.equal($http);
      });

    });

    describe('#_$q', function () {

      it('should be an object', function () {
        expect(contentful._$q).to.be.a('function');
      });

      it('should equal $q by default', function () {
        expect(contentful._$q).to.equal($q);
      });

    });


    describe('#asset', function () {

      it('should be a function', function () {
        expect(contentful.asset).to.be.a('function');
      });

    });

    describe('#asset(id)', function () {

      it('should perform a request to the correct API endpoint', function (done) {
        var id = 'customId';
        $httpBackend
          .expectGET(expectedHost + '/spaces/dummySpace/assets/' + id + '?access_token=dummyAccessToken')
          .respond(200, '');
        contentful.asset(id).then(
          function () {
            done();
          },
          function () {
            done();
          }
        );
        $httpBackend.flush();
      });

    });

    describe('#assets', function () {

      it('should be a function', function () {
        expect(contentful.assets).to.be.a('function');
      });

    });

    describe('#assets()', function () {

      it('should perform a request to the correct API endpoint', function (done) {
        $httpBackend
          .expectGET(expectedHost + '/spaces/dummySpace/assets?access_token=dummyAccessToken')
          .respond(200, '');
        contentful.assets().then(
          function () {
            done();
          },
          function () {
            done();
          }
        );
        $httpBackend.flush();
      });

    });

    describe('#contentType', function () {

      it('should be a function', function () {
        expect(contentful.contentType).to.be.a('function');
      });

    });

    describe('#contentType(id)', function () {

      it('should perform a request to the correct API endpoint', function (done) {
        var id = 'customId';
        $httpBackend
          .expectGET(expectedHost + '/spaces/dummySpace/content_types/' + id + '?access_token=dummyAccessToken')
          .respond(200, '');
        contentful.contentType(id).then(
          function () {
            done();
          },
          function () {
            done();
          }
        );
        $httpBackend.flush();
      });

    });

    describe('#contentTypes', function () {

      it('should be a function', function () {
        expect(contentful.contentTypes).to.be.a('function');
      });

    });

    describe('#contentTypes()', function () {

      it('should perform a request to the correct API endpoint', function (done) {
        $httpBackend
          .expectGET(expectedHost + '/spaces/dummySpace/content_types?access_token=dummyAccessToken')
          .respond(200, '');
        contentful.contentTypes().then(
          function () {
            done();
          },
          function () {
            done();
          }
        );
        $httpBackend.flush();
      });

    });

    describe('#entry', function () {

      it('should be a function', function () {
        expect(contentful.entry).to.be.a('function');
      });

    });

    describe('#entry(id)', function () {

      it('should perform a request to the correct API endpoint', function (done) {
        var id = 'customId';
        $httpBackend
          .expectGET(expectedHost + '/spaces/dummySpace/entries/' + id + '?access_token=dummyAccessToken')
          .respond(200, '');
        contentful.entry(id).then(
          function () {
            done();
          },
          function () {
            done();
          }
        );
        $httpBackend.flush();
      });

    });

    describe('#entries', function () {

      it('should be a function', function () {
        expect(contentful.entries).to.be.a('function');
      });

    });

    describe('#entries()', function () {

      it('should perform a request to the correct API endpoint', function (done) {
        $httpBackend
          .expectGET(expectedHost + '/spaces/dummySpace/entries?access_token=dummyAccessToken')
          .respond(200, '');
        contentful.entries().then(
          function () {
            done();
          },
          function () {
            done();
          }
        );
        $httpBackend.flush();
      });

    });

    describe('#space', function () {

      it('should be a function', function () {
        expect(contentful.space).to.be.a('function');
      });

    });

    describe('#space()', function () {

      it('should perform a request to the correct API endpoint', function (done) {
        $httpBackend
          .expectGET(expectedHost + '/spaces/dummySpace?access_token=dummyAccessToken')
          .respond(200, '');
        contentful.space().then(
          function () {
            done();
          },
          function () {
            done();
          }
        );
        $httpBackend.flush();
      });

    });

  });

});
