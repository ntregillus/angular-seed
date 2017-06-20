'use strict';

angular.module('myApp.terminal', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/terminal', {
    templateUrl: 'terminal/terminal.html',
    controller: 'TerminalCtrl'
  });
}])

.controller('TerminalCtrl', ['$scope', '$pay',
function($scope, $pay) {
  $scope.responses = $scope.responses||[];
  $scope.request = $scope.request||{}; //fields will be added via angular!
  $scope.requestPayment = function(){
    var msg = $scope.request;
    $pay.processCredit(msg, function(response){
      if (response.isSuccessful){
        $scope.request = {};
        $scope.responses.unshift(response.content);
      }
    });
  };

}]);
