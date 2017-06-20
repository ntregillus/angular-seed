'use strict';

angular.module('myApp.configure', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/configure', {
    templateUrl: 'configure/configure.html',
    controller: 'ConfigureCtrl'
  });
}])

.controller('ConfigureCtrl', ['$rootScope', '$scope', '$localStorage',
function($rootScope, $scope, $localStorage) {
    $scope.url = $rootScope.config.url;
    $scope.secret = $rootScope.config.secret;
    $scope.saveConfig = function(url, secret){
      var config = {
        url: url,
        secret: secret
      };
      $rootScope.config = config;
      $localStorage.save('config', config);
      $rootScope.notifications.unshift({class:"success", message:"Saved Configuration"});
    };
}]);
