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
