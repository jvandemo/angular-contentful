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
      return this.processResponseWithMultipleEntries(
        this.request('/assets', configifyParams(paramifyQuerystring(querystring)))
      );
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
      return this.processResponseWithMultipleEntries(
        this.request('/content_types', configifyParams(paramifyQuerystring(querystring)))
      );
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
      return this.processResponseWithMultipleEntries(
        this.request('/entries', configifyParams(paramifyQuerystring(querystring)))
      );
    };

    /**
     * Get space
     *
     * @returns {promise}
     */
    Contentful.prototype.space = function () {
      return this.request('');
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
