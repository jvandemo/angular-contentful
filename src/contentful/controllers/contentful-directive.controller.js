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
  function ContentfulDirectiveCtrl($scope, $attrs, contentful) {

    // Passed value is required entry id
    if ($attrs.contentfulEntry) {
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
  ContentfulDirectiveCtrl.$inject = ['$scope', '$attrs', 'contentful'];

  // Export
  angular
    .module('contentful')
    .controller('ContentfulDirectiveCtrl', ContentfulDirectiveCtrl);

})();
