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
      if (newOptions.space) {
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
