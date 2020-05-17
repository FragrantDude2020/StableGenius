app
	.controller("OptionsPageController", ['$scope', '$uibModal', 'httpService', 'alertService', function ($scope, $uibModal, httpService, alertService) {
		$scope.alertService = alertService;

		httpService.DataRootUrl = 'http://localhost';

		$scope.usersList = undefined;
		$scope.gettingUsers = false;

		$scope.clearData = function () {
			if (confirm("This will clear all your StableGenius data. Are you sure you want to do this?")) {
				//debugger;

				chrome.storage.sync.clear(function () {
					$scope.getUsers();
				});
			}
		}

		$scope.getUsers = function () {
			$scope.usersList = null;
			$scope.gettingUsers = true;

			//console.log("getting users");

			chrome.storage.sync.get(["users"], function (result) {
				//debugger;

				$scope.gettingUsers = false;

				// check to make sure the users list exists
				if (result.users !== undefined) {
					//console.log("found users: ", result.users);

					//debugger;

					$scope.$apply(function () {
						$scope.usersList = angular.copy(result.users);

						//console.log("assigned users: ", $scope.usersList);
					});
				} else {
					//console.log("no users found, resetting");

					var authorDetails = result || {};

					// create a new users list
					authorDetails.users = authorDetails.users || {};

					//console.log("setting sync storage to: ", authorDetails);
					$scope.saveSGDatabase(authorDetails);
				}
			});
		}

		$scope.updateUsersData = function (usersList, ErrorCallback) {
			chrome.storage.sync.get(["users"], function (result) {
				//debugger;

				// check to make sure the users list exists
				if (result.users !== undefined) {
					//console.log("found users: ", result.users);

					//debugger;

					result.users = usersList;

					$scope.saveSGDatabase(result);
				} else {
					//console.log("no users found, resetting");

					ErrorCallback(result);
				}
			});

        }

		$scope.saveSGDatabase = function (sgDatabase, refreshUsers) {
			refreshUsers = refreshUsers || true;

			// write the new users list back out to sync storage
			chrome.storage.sync.set(sgDatabase, function () {
				//debugger;

				//console.log("sync storage set complete");

				if (refreshUsers)
					$scope.getUsers();
			});		
		}

		$scope.deleteUser = function (user) {
			//debugger;

			//var selectedUser = $scope.usersList[user];

			//$scope.$apply($scope.delete(selectedUser));
			delete $scope.usersList[user];

			$scope.updateUsersData($scope.usersList);
        }

		$scope.getObjectPropertiesCount = function (objectProperty) {
			if (objectProperty === null)
				return -1;

			if (objectProperty === undefined)
				return -2;

			//debugger;

			return Object.getOwnPropertyNames(objectProperty).length;
        }

		$scope.getUsers();
	}]);
