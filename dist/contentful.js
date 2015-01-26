(function () {

  // Modules
  angular.module('contentful', []);

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
    Contentful.prototype.assets = function (query) {
      return this.request('/assets', {
        params: {
          query: query
        }
      });
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
    Contentful.prototype.contentTypes = function (query) {
      return this.request('/content_types', {
        params: {
          query: query
        }
      });
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
    Contentful.prototype.entries = function (query) {
      return this.request('/entries', {
        params: {
          query: query
        }
      });
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

  // Export
  angular
    .module('contentful')
    .provider('contentful', contentfulProvider);

})();
