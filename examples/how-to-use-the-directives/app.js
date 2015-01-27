(function () {

  // Modules
  angular.module('app', ['contentful']);

  angular
    .module('app')
    .config(function (contentfulProvider) {
      contentfulProvider.setOptions({
        space: 'cfexampleapi',
        accessToken: 'b4c0n73n7fu1'
      });
    });

})();
