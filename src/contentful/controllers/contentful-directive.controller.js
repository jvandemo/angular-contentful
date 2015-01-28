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
  function ContentfulDirectiveCtrl($attrs, contentful, contentfulHelpers) {

    var self = this;

    // Placeholder
    this.entry = null;
    this.entries = [];

    // Passed value is required entry id
    if ($attrs.contentfulEntry) {
      contentful
        .entry($attrs.contentfulEntry)
        .then(function (response) {
          self.entry = response.data;
        });
    }

    // Passed value is optional query
    if ($attrs.hasOwnProperty('contentfulEntries')) {
      contentful
        .entries($attrs.contentfulEntries)
        .then(function (response) {
          var entries = {
            limit: response.data.limit,
            skip: response.data.skip,
            total: response.data.total
          };
          entries.items = contentfulHelpers.resolveResponse(response.data);
          self.entries = entries;
        });
    }

  }

  // Inject controller dependencies
  ContentfulDirectiveCtrl.$inject = ['$attrs', 'contentful', 'contentfulHelpers'];

  // Export
  angular
    .module('contentful')
    .controller('ContentfulDirectiveCtrl', ContentfulDirectiveCtrl);

})();
