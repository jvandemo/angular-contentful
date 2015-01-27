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
  function ContentfulDirectiveCtrl($attrs, contentful) {

    var self = this;

    // Placeholder
    this.entry = null;
    this.entries = [];

    if ($attrs.contentfulEntry) {
      contentful
        .entry($attrs.contentfulEntry)
        .then(function (response) {
          self.entry = response.data;
        });
    }

    if ($attrs.contentfulEntries) {
      contentful
        .entries($attrs.contentfulEntries)
        .then(function (response) {
          self.entries = response.data;
        });
    }

  }

  // Inject controller dependencies
  ContentfulDirectiveCtrl.$inject = ['$attrs', 'contentful'];

  // Export
  angular
    .module('contentful')
    .controller('ContentfulDirectiveCtrl', ContentfulDirectiveCtrl);

})();
