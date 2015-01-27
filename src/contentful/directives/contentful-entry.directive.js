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
