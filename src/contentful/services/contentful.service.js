(function () {

  /**
   * Contentful service provider
   */
  function contentfulProvider(){

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

    /**
     * Create the contentful service
     *
     * @returns {contentfulProvider.Contentful}
     */
    this.$get = function () {

      function Contentful() {
        this.options = options;
      }

      return new Contentful();
    };

  }

  // Export
  angular
    .module('contentful')
    .provider('contentful', contentfulProvider);

})();
