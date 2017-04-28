(function () {

  // Modules
  angular.module('contentful', []);

})();

(function () {

  /**
   * Controller for contentful directives
   *
   * By separating the controller we can avoid a lot of
   * repetitive code and keep the code base as small as
   * possible.
   *
   * @param $attrs
   * @param contentful
   * @constructor
   */
  function ContentfulDirectiveCtrl($scope, $attrs, contentful, contentfulHelpers) {

    var query;

    // Passed value is required entry id
    if ($attrs.contentfulEntry) {

      query = $scope.$eval($attrs.contentfulEntry);

      // In case we detect a query string instead of simple id, we fetch the
      // collection and return the first entry
      if(contentfulHelpers.isQueryString(query)){

        // Fetch entry by query
        contentful
          .entries(query)
          .then(
            function (response) {
              var firstEntry = {};
              if(response.data && response.data.items && response.data.items.length){
                firstEntry = response.data.items[0];
              }
              $scope.$contentfulEntry = firstEntry;
            },
            function(){
              $scope.$contentfulEntry = {};
            }
          );

      } else {

        // Fetch entry by id
        contentful
          .entry(query)
          .then(
          function (response) {
            $scope.$contentfulEntry = response.data;
          },
          function(){
            $scope.$contentfulEntry = {};
          }
        );

      }

    }

    // Passed value is optional query
    if ($attrs.hasOwnProperty('contentfulEntries')) {

      query = $scope.$eval($attrs.contentfulEntries);

      contentful
        .entries(query)
        .then(
          function (response) {
            $scope.$contentfulEntries = response.data;
          },
          function(){
            $scope.$contentfulEntries = {
              limit: 0,
              skip: 0,
              total: 0,
              items: []
            };
          }
        );
    }

  }

  // Inject controller dependencies
  ContentfulDirectiveCtrl.$inject = ['$scope', '$attrs', 'contentful', 'contentfulHelpers'];

  // Export
  angular
    .module('contentful')
    .controller('ContentfulDirectiveCtrl', ContentfulDirectiveCtrl);

})();

(function () {

  /**
   * Directive
   *
   * @returns {object} directive definition object
   */
  function contentfulEntriesDirective() {

    return {
      restrict: 'EA',
      scope: true,
      controller: 'ContentfulDirectiveCtrl'
    };

  }

  // Inject directive dependencies
  contentfulEntriesDirective.$inject = [];

  // Export
  angular
    .module('contentful')
    .directive('contentfulEntries', contentfulEntriesDirective);

})();

(function () {

  /**
   * Directive
   *
   * @returns {object} directive definition object
   */
  function contentfulEntryDirective() {

    return {
      restrict: 'EA',
      scope: true,
      controller: 'ContentfulDirectiveCtrl'
    };

  }

  // Inject directive dependencies
  contentfulEntryDirective.$inject = [];

  // Export
  angular
    .module('contentful')
    .directive('contentfulEntry', contentfulEntryDirective);

})();

(function () {

  function contentfulHelpersFactory() {

    function ContentfulHelpers() {
    }

    /**
     * Resolve a complete response
     *
     * @param response
     * @returns {Array}
     */
    ContentfulHelpers.prototype.resolveResponse = function resolveResponse(response) {
      var self = this;
      self.walkMutate(response, self.isLink, function (link) {
        return self.getLink(response, link) || link;
      });
      return response.items || [];
    };

    /**
     * Check if object is a link
     *
     * @param {object}
     * @returns {boolean}
     */
    ContentfulHelpers.prototype.isLink = function isLink(object) {
      if (object && object.sys && object.sys.type && object.sys.type === 'Link') {
        return true;
      }
      return false;
    };

    /**
     * Find and return a link in a response
     *
     * @param response
     * @param link
     * @returns {object|null} Link
     */
    ContentfulHelpers.prototype.getLink = function getLink(response, link) {
      var self = this;
      var type = link.sys.linkType;
      var id = link.sys.id;
      var pred = function (resource) {
        return resource && resource.sys && resource.sys.type === type && resource.sys.id === id;
      };
      return self.findLink(response.items, pred) ||
        response.includes && self.findLink(response.includes[type], pred);
    };

    /**
     * Helper method to find a link in an array
     *
     * @param {Array} arr - Array to search
     * @param {function} pred - Predicate function
     * @returns {object|null} Link
     */
    ContentfulHelpers.prototype.findLink = function findLink(arr, pred) {
      var i;
      var link = null;
      if (!angular.isArray(arr)) {
        return link;
      }
      for (i = 0; i < arr.length; i++) {
        if (pred(arr[i])) {
          link = arr[i];
          break;
        }
      }
      return link;
    };

    /**
     * Walk a data structure and mutate properties that match the predicate function
     *
     * @param {object|array} input - Input data
     * @param {function} pred - Prediction function
     * @param {function} mutator - Mutator function
     * @returns {*}
     */
    ContentfulHelpers.prototype.walkMutate = function walkMutate(input, pred, mutator) {
      var self = this;
      if (pred(input)){
        return mutator(input);
      }

      if (angular.isArray(input) || angular.isObject(input)) {
        angular.forEach(input, function (item, key) {
          input[key] = self.walkMutate(item, pred, mutator);
        });
        return input;
      }
      return input;
    };


    /**
     * Check if a string is a query string
     *
     * @param {string} input
     * @returns {boolean}
     */
    ContentfulHelpers.prototype.isQueryString = function isQueryString(input) {
      if(input.toString().indexOf('=') > -1){
        return true;
      }
      if(input.toString().indexOf('&') > -1){
        return true;
      }
      if(input.toString().indexOf('?') > -1){
        return true;
      }
      return false;
    };



    return new ContentfulHelpers();

  }

  // Export
  angular
    .module('contentful')
    .factory('contentfulHelpers', contentfulHelpersFactory);

})();

(function () {

  /**
   * Contentful service provider
   */
  function contentfulProvider() {

    // Default options
    var options = {
      'default': {
        host: 'cdn.contentful.com',
        space: null,
        accessToken: null,
        secure: true
      }
    };

    /**
     * Set options
     *
     * @param {object} newOptions
     * @returns {contentfulProvider}
     */
    this.setOptions = function (newOptions) {
      if (newOptions && newOptions.space) {
        angular.extend(options['default'], newOptions);
      } else {
        angular.extend(options, newOptions);
      }
      return this;
    };

    this.$get = contentfulFactory;

    /**
     * Create the contentful service
     *
     * @returns {contentfulProvider.Contentful}
     */
    function contentfulFactory($http, $q, contentfulHelpers) {
      return new Contentful($http, $q, contentfulHelpers, options);
    }

    // Inject dependencies in factory
    contentfulFactory.$inject = ['$http', '$q', 'contentfulHelpers'];

    /**
     * Contentful service constructor
     *
     * @constructor
     */
    function Contentful($http, $q, contentfulHelpers, options) {

      this._$http = $http;
      this._$q = $q;
      this._contentfulHelpers = contentfulHelpers;
      this.options = options;

      if (typeof $http.get !== 'function') {
        throw new Error('The contentful service needs a valid http service to work with');
      }

      if (typeof $q.when !== 'function') {
        throw new Error('The contentful service needs a valid promise service to work with');
      }
    }

    /**
     * Perform request
     *
     * @param {string} path
     * @param {object} config
     * @param {object} optionSet
     * @returns {promise}
     */
    Contentful.prototype.request = function (path, config, optionSet) {
      optionSet = optionSet || 'default';
      var url;
      var nonEmptyParams = {};

      // Make sure config is valid
      config = config || {};
      config.headers = config.headers || {};
      config.params = config.params || {};

      // Add required configuration
      config.headers['Content-Type'] = 'application/vnd.contentful.delivery.v1+json';
      config.params['access_token'] = this.options[optionSet].accessToken;

      // Build url
      url = [
        this.options[optionSet].secure ? 'https' : 'http',
        '://',
        this.options[optionSet].host,
        ':',
        this.options[optionSet].secure ? '443' : '80',
        '/spaces/',
        this.options[optionSet].space,
        path
      ].join('');

      // Perform request and return promise
      return this._$http.get(url, config);
    };

    /**
     * Get an asset
     *
     * @param id
     * @param optionSet {object}
     * @returns {promise}
     */
    Contentful.prototype.asset = function (id, optionSet) {
      optionSet = optionSet || 'default';
      return this.request('/assets/' + id, {}, optionSet);
    };

    /**
     * Get assets
     *
     * @param query
     * @param optionSet {object}
     * @returns {promise}
     */
    Contentful.prototype.assets = function (querystring, optionSet) {
      optionSet = optionSet || 'default';
      return this.processResponseWithMultipleEntries(
        this.request('/assets', configifyParams(paramifyQuerystring(querystring)), optionSet)
      );
    };

    /**
     * Get content type
     *
     * @param id
     * @param optionSet {object}
     * @returns {promise}
     */
    Contentful.prototype.contentType = function (id, optionSet) {
      optionSet = optionSet || 'default';
      return this.request('/content_types/' + id, {}, optionSet);
    };

    /**
     * Get content types
     *
     * @param query
     * @param optionSet {object}
     * @returns {promise}
     */
    Contentful.prototype.contentTypes = function (querystring, optionSet) {
      optionSet = optionSet || 'default';
      return this.processResponseWithMultipleEntries(
        this.request('/content_types', configifyParams(paramifyQuerystring(querystring)), optionSet)
      );
    };

    /**
     * Get entry
     *
     * @param id
     * @param optionSet {object}
     * @returns {promise}
     */
    Contentful.prototype.entry = function (id, optionSet) {
      optionSet = optionSet || 'default';
      return this.request('/entries/' + id, {}, optionSet);
    };

    /**
     * Get entries
     *
     * @param query
     * @param optionSet {object}
     * @returns {promise}
     */
    Contentful.prototype.entries = function (querystring, optionSet) {
      optionSet = optionSet || 'default';
      return this.processResponseWithMultipleEntries(
        this.request('/entries', configifyParams(paramifyQuerystring(querystring)), optionSet)
      );
    };

    /**
     * Get space
     *
     * @param optionSet {object}
     * @returns {promise}
     */
    Contentful.prototype.space = function (optionSet) {
      optionSet = optionSet || 'default';
      return this.request('', {}, optionSet);
    };

    /**
     * Process multiple incoming entries
     *
     * Resolves links in the response.data.
     *
     * @param promise
     * @returns {*}
     */
    Contentful.prototype.processResponseWithMultipleEntries = function(promise){
      var self = this;
      if(promise && promise.then){
        promise.then(

          // Automatically resolve links on success
          function(response){
            var entries = {
              limit: response.data.limit,
              skip: response.data.skip,
              total: response.data.total
            };
            entries.items = self._contentfulHelpers.resolveResponse(response.data);
            response.data = entries;
            return response;
          },

          // Forward error on failure
          function(response){
            return response;
          }
        );
      }
      return promise;
    };

    /**
     * Process single incoming entry
     *
     * For now, this is just a noop but it exists so it makes
     * sure a $q promise is returned with only then method
     * (removing shorthand success and error methods)
     * and to have single point of entry in case transformation
     * is needed in the future.
     *
     * @param promise
     * @returns {*}
     */
    Contentful.prototype.processResponseWithSingleEntry = function(promise){
      if(promise && promise.then){
        promise.then(

          // Forward error on failure
          function(response){
            return response;
          },

          // Forward error on failure
          function(response){
            return response;
          }
        );
      }
      return promise;
    };

  }

  /**
   * Create params object from querystring
   *
   * @param querystring
   * @returns {object} params
   */
  function paramifyQuerystring(querystring){
    var params = {};

    if(!querystring){
      return params;
    }

    // Split querystring in parts separated by '&'
    var couples = querystring.toString().split('&');
    angular.forEach(couples, function(couple){

      // Split in parts separated by '='
      var parts = couple.split('=');

      // Only add if an actual value is passed
      // to prevent empty params in the url
      if(parts.length > 1){
        params[parts[0]] = parts[1];
      }
    });
    return params;
  }

  /**
   * Create config object from params
   *
   * @param params
   * @returns {object} config
   */
  function configifyParams(params){
    if(!angular.isObject(params)){
      params = {};
    }
    return {
      params: params
    };
  }

  // Export
  angular
    .module('contentful')
    .provider('contentful', contentfulProvider);

})();
