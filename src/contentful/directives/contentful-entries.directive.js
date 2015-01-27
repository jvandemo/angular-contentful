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
