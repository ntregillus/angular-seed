'use strict';

// Declare app level module which depends on views, and components
var app = angular.module('myApp', [
	'ngRoute',
	'myApp.configure',
	'myApp.terminal',
	'myApp.bulk-payments',
	'myApp.version'
]);
app.service('$localStorage', function(){

	this.save = function(key, value){
		localStorage.setItem(key, JSON.stringify(value));
	};
	this.get = function(key){
		var result = null;
		var value = localStorage.getItem(key);
		if(value){
			result = JSON.parse(value);
		}
		return result;
	}

});

app.service('$pay', ['$http', '$rootScope', function($http, $rootScope){
	$rootScope.config;
	var buildSuccessHandler = function(callback, suppressNotification){
		return function(response){
			if(!suppressNotification)
			{
				$rootScope.notifications.unshift({
					class: "success",
					message: (response.data.Status||"Success")
									+ " (" + (response.data.Account|| "NoAccount") + ")"
									+ ":" + response.data.Message
				});
			}
			if(callback)
			{
				callback({content: response.data, isSuccessful: true});
			}
		};
	};
	var buildFailureHandler = function(callback, suppressNotification){
		return function(response){
			var formattedMsg = (response.data.Status||"ERROR")
							+ " (" + (response.data.Account|| "NoAccount") + ")"
							+ ":" + response.data.Message;
			if(!suppressNotification)
			{

				$rootScope.notifications.unshift({
					class: "failure",
					message: formattedMsg
				});
			}
			if(callback)
			{
				callback({content: response.data, isSuccessful: false, formattedMsg: formattedMsg});
			}
		};
	};
	var headers = {
		 'Authorization': $rootScope.config.secret,
		 'Content-Type': 'application/json'
	 };
	this.processCredit = function (payload, callback, suppressNotification){
		$http({
			method: 'POST',
			url: $rootScope.config.url + 'credit/sale/',
			data: JSON.stringify(payload),
			headers: headers
		}).then(buildSuccessHandler(callback, suppressNotification),
						buildFailureHandler(callback, suppressNotification));

	};
	this.authCheck = function(payload, callback, suppressNotification){
		$http({
			method: 'POST',
			url: $rootScope.config.url + 'credit/authonly',
			data: JSON.stringify(payload),
			headers: headers
		}).then(buildSuccessHandler(callback), buildFailureHandler(callback));
	};
}]);

app.config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
	$locationProvider.hashPrefix('!');
	$routeProvider.otherwise({redirectTo: '/configure'});
}]);

app.controller("NotificationCtrl", ['$rootScope', function($rootScope){
	$rootScope.notifications = [];;
	$rootScope.closeNotification = function(item){
		var index = $rootScope.notifications.indexOf(item);
		$rootScope.notifications.splice(index, 1);
	};
}]);

app.run(function($rootScope, $localStorage){

		$rootScope.config = $localStorage.get('config');
		//initializing scope
		if (!$rootScope.config){
			$rootScope.config = {
				url: '',
				secret: ''
			};
			$localStorage.save('config', $rootScope.config);
		}
		$rootScope.notifications = [{class:'test', message:"test this"}];

});
