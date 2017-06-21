'use strict';

angular.module('myApp.bulk-payments', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/bulk-payments', {
		templateUrl: 'bulk-payments/bulk-payments.html',
		controller: 'BulkPaymentsCtrl'
	});
}])

.controller('BulkPaymentsCtrl', ['$rootScope', '$scope', '$localStorage', '$pay',
function($rootScope, $scope, $localStorage, $pay) {
	$scope.mode = 'process';
	$scope.savedAccounts = $localStorage.get('savedAccounts') || [];
  $scope.request = $scope.request || {};
	$scope.hasChanges = false;
	$scope.processing = false;
	$scope.authAndAddCard = function (){
		var authData = $scope.request;
		authData.Amount = 0.00;
		var reccuringAmount = $scope.reccuringAmount;
		var alias = $scope.alias;
		$pay.authCheck(authData, function(response){
			if(!response.isSuccessful){
				return;
			}
			var content = response.content;
			var matchingAccounts = $scope.savedAccounts.filter(function(a){
				a.token == content.token || a.alias == alias
			})
			if (matchingAccounts.length > 0)
			{
				var index = $scope.savedAccounts.indexOf(matchingAccounts[0]);

				$rootScope.notifications.unshift({
					class: 'failure',
					message: "An account already exists for " + content.Account
								+ ", alias:''" + alias + "' '(see row "+index+")"
				});
				return;
			}

			$scope.savedAccounts.unshift({
				token: content.Token,
				account: content.Account,
				alias: alias,
				amount: reccuringAmount,
				lastProcessedDate: null,
				history: [],
			});

			$localStorage.save('savedAccounts', $scope.savedAccounts);
			$rootScope.notifications.unshift({
				class: 'success',
				message: "Added " + alias
			});
		}, true);
	};

	$scope.removeAccount = function (account){
		if(!confirm('are you sure you want to remove' + account.alias + "?"))
		{
			return;
		}
		var index = $scope.savedAccounts.indexOf(account);
		$scope.savedAccounts.splice(index, 1);
		$localStorage.save('savedAccounts', $scope.savedAccounts);
	};


	$scope.bulkProcess = function(accountsToProcess) {
		$scope.processing = true;
		var failures = [];
		var successCount = 0;
		var processedCount = 0;
		for(let i = 0; i < accountsToProcess.length; i++){
			var account = accountsToProcess[i];
			var payload = {
				Token: account.token,
				Amount: account.amount,
			};
			if (account.zip && account.zip.length > 0){
				payload.Zip = account.zip;
			}

			$pay.processCredit(payload, function(response){
				processedCount++;
				if(response.isSuccessful){
					successCount++;
				}
				else{
					failures.push(response.content);
				}
				var curAccount = $scope.savedAccounts.filter(function(a){return a.token == response.content.Token});
				if(curAccount.length > 0){
					curAccount[0].lastProcessedDate = Date.now();
					curAccount[0].history.unshift({amount:response.content.Amount, processedDate: Date.now()});
				}
				if(processedCount == accountsToProcess.length){
					if(failures.length == 0){
						$rootScope.notifications.unshift({
							class: 'success',
							message: "Successfully processed " + successCount + " transactions"
						});
					}else{
						for(let f; f > failures.length; f++){
							var curFail = failures[f];
							$rootScope.notifications.unshift({
								class: 'failure',
								message: curFail.formattedMsg
							});
						}
					}
					$scope.processing = false;
					$scope.saveAmountChanges(true);
				}
			}, true);
		}

	};

	$scope.saveAmountChanges = function(suppressNotification) {
			$localStorage.save('savedAccounts', $scope.savedAccounts);
			if(typeof(suppressNotification) === 'undefined' || suppressNotification == false)
			{
				$rootScope.notifications.unshift({
					class: 'success',
					message: "Saved Amount Changes"
				});
			}
			$scope.hasChanges = false;
	};

	$scope.saveAndBulkProcess = function() {
			$scope.bulkProcess($scope.savedAccounts);
	};

}]);
