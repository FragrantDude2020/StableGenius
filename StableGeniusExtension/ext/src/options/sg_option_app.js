app
	/*
	.config(['$compileProvider', function ($compileProvider) {
		$compileProvider.debugInfoEnabled(false);
		$compileProvider.commentDirectivesEnabled(false);
		$compileProvider.cssClassDirectivesEnabled(false);
	}])
	*/
	.controller("OptionsPageController", ['$scope', '$uibModal', 'httpService', 'alertService', function ($scope, $uibModal, httpService, alertService) {
		$scope.alertService = alertService;

		httpService.DataRootUrl = 'http://localhost';

		$scope.clearData = function () {
			if (confirm("This will clear all your StableGenius data. Are you sure you want to do this?")) {
				debugger;

				chrome.storage.sync.clear();
			}
		}
	}]);
