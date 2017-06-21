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
    $scope.$watch('secret',function(oldValue, newValue){
      if (newValue.startsWith('local')){
        $scope.url = 'http://localhost:7003/v1/';
      }else if (newValue.startsWith('test')){
        $scope.url = 'https://pay-test.monetary.co/v1/'
      }else if (newValue.startsWith('cert')){
        $scope.url = 'https://pay-cert.monetary.co/v1/'
      }else{
        $scope.url = 'https://pay.monetary.co/v1/'
      }
    })
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
