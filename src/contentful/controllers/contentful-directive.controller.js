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

    // Passed value is required entry id
    if ($attrs.contentfulEntry) {

      // In case we detect a query string instead of simple id, we fetch the
      // collection and return the first entry
      if(contentfulHelpers.isQueryString($attrs.contentfulEntry)){

        // Fetch entry by query
        contentful
          .entries($attrs.contentfulEntry)
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
          .entry($attrs.contentfulEntry)
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
      contentful
        .entries($attrs.contentfulEntries)
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
