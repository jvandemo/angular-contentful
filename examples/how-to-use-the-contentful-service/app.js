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

  angular
    .module('app')
    .controller('DemoCtrl', function ($scope, contentful) {

      var promise;

      $scope.busy = false;
      $scope.response = null;

      $scope.$watch('action', function (action, old) {

        // Still performing previous request
        if ($scope.busy) {
          return;
        }

        if (action === old) {
          return;
        }

        promise = null;
        $scope.busy = true;

        if (action === 'space') {
          promise = contentful.space();
        }

        if (action === 'contentTypes') {
          promise = contentful.contentTypes();
        }

        if (action === 'entry') {
          promise = contentful.entry('6KntaYXaHSyIw8M6eo26OK');
        }

        if (action === 'entries') {
          promise = contentful.entries();
        }

        if (!promise) {
          $scope.response = null;
          $scope.busy = false;
          return;
        }

        promise.then(
          function (response) {
            $scope.response = response;
            $scope.busy = false;
          },
          function (response) {
            $scope.response = response;
            $scope.busy = false;
          }
        )

      });

    });

})();
