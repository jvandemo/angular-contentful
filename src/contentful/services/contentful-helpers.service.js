(function () {

  function contentfulHelpersFactory() {

    function ContentfulHelpers() {
    }

    ContentfulHelpers.prototype.resolveResponse = function resolveResponse(response) {
      var self = this;
      self.walkMutate(response, self.isLink, function (link) {
        return self.getLink(response, link) || link;
      });
      return response.items || [];
    };

    ContentfulHelpers.prototype.isLink = function isLink(object) {
      if (object && object.sys && object.sys.type && object.sys.type === 'Link') {
        return true;
      }
      return false;
    };

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
