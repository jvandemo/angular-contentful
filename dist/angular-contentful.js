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
  function ContentfulDirectiveCtrl($attrs, contentful, contentfulHelpers) {

    var self = this;

    // Placeholder
    this.entry = null;
    this.entries = [];

    // Passed value is required entry id
    if ($attrs.contentfulEntry) {
      contentful
        .entry($attrs.contentfulEntry)
        .then(function (response) {
          self.entry = response.data;
        });
    }

    // Passed value is optional query
    if ($attrs.hasOwnProperty('contentfulEntries')) {
      contentful
        .entries($attrs.contentfulEntries)
        .then(function (response) {
          var entries = {
            limit: response.data.limit,
            skip: response.data.skip,
            total: response.data.total
          };
          entries.items = contentfulHelpers.resolveResponse(response.data);
          self.entries = entries;
        });
    }

  }

  // Inject controller dependencies
  ContentfulDirectiveCtrl.$inject = ['$attrs', 'contentful', 'contentfulHelpers'];

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
      controller: 'ContentfulDirectiveCtrl',
      controllerAs: '$contentfulEntries'
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
      controller: 'ContentfulDirectiveCtrl',
      controllerAs: '$contentfulEntry'
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
      host: 'cdn.contentful.com',
      space: null,
      accessToken: null,
      secure: true
    };

    /**
     * Set options
     *
     * @param {object} newOptions
     * @returns {contentfulProvider}
     */
    this.setOptions = function (newOptions) {
      angular.extend(options, newOptions);
      return this;
    };

    this.$get = contentfulFactory;

    /**
     * Create the contentful service
     *
     * @returns {contentfulProvider.Contentful}
     */
    function contentfulFactory($http, $q) {
      return new Contentful($http, $q, options);
    }

    // Inject dependencies in factory
    contentfulFactory.$inject = ['$http', '$q'];

    /**
     * Contentful service constructor
     *
     * @constructor
     */
    function Contentful($http, $q, options) {

      this._$http = $http;
      this._$q = $q;
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
     * @returns {promise}
     */
    Contentful.prototype.request = function (path, config) {

      var url;
      var nonEmptyParams = {};

      // Make sure config is valid
      config = config || {};
      config.headers = config.headers || {};
      config.params = config.params || {};

      // Add required configuration
      config.headers['Content-Type'] = 'application/vnd.contentful.delivery.v1+json';
      config.params['access_token'] = this.options.accessToken;

      // Build url
      url = [
        this.options.secure ? 'https' : 'http',
        '://',
        this.options.host,
        ':',
        this.options.secure ? '443' : '80',
        '/spaces/',
        this.options.space,
        path
      ].join('');

      // Perform request and return promise
      return this._$http.get(url, config);
    };

    /**
     * Get an asset
     *
     * @param id
     * @returns {promise}
     */
    Contentful.prototype.asset = function (id) {
      return this.request('/assets/' + id);
    };

    /**
     * Get assets
     *
     * @param query
     * @returns {promise}
     */
    Contentful.prototype.assets = function (querystring) {
      return this.request('/assets', configifyParams(paramifyQuerystring(querystring)));
    };

    /**
     * Get content type
     *
     * @param id
     * @returns {promise}
     */
    Contentful.prototype.contentType = function (id) {
      return this.request('/content_types/' + id);
    };

    /**
     * Get content types
     *
     * @param query
     * @returns {promise}
     */
    Contentful.prototype.contentTypes = function (querystring) {
      return this.request('/content_types', configifyParams(paramifyQuerystring(querystring)));
    };

    /**
     * Get entry
     *
     * @param id
     * @returns {promise}
     */
    Contentful.prototype.entry = function (id) {
      return this.request('/entries/' + id);
    };

    /**
     * Get entries
     *
     * @param query
     * @returns {promise}
     */
    Contentful.prototype.entries = function (querystring) {
      return this.request('/entries', configifyParams(paramifyQuerystring(querystring)));
    };

    /**
     * Get space
     *
     * @returns {promise}
     */
    Contentful.prototype.space = function () {
      return this.request('');
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
