'use strict';

describe('contentfulHelpers service', function () {

  var contentfulHelpers;

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

  beforeEach(module('contentful'));

  beforeEach(inject(function(_contentfulHelpers_){
    contentfulHelpers = _contentfulHelpers_;
  }));

  describe('resolveResponse', function () {

    it('should be a method', function () {
      expect(contentfulHelpers.resolveResponse).to.be.a('function');
    });

    it('should return the expected object', function () {
      expect(contentfulHelpers.resolveResponse(sampleResponse)).to.deep.equal(expectedOutcome);
    });

  });

  describe('isQueryString', function () {

    it('should be a method', function () {
      expect(contentfulHelpers.isQueryString).to.be.a('function');
    });

  });

  describe('isQueryString(id)', function () {

    it('should return false', function () {
      expect(contentfulHelpers.isQueryString('31Eu8SwBxCEuSOIWEu8wUM')).to.equal(false);
    });

  });

  describe('isQueryString(stringwith?)', function () {

    it('should return false', function () {
      expect(contentfulHelpers.isQueryString('stringwith?')).to.equal(true);
    });

  });

  describe('isQueryString(stringwith=)', function () {

    it('should return false', function () {
      expect(contentfulHelpers.isQueryString('stringwith=')).to.equal(true);
    });

  });

  describe('isQueryString(stringwith&)', function () {

    it('should return false', function () {
      expect(contentfulHelpers.isQueryString('stringwith&')).to.equal(true);
    });

  });


});
