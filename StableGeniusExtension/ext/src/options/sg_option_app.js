app
	.controller("OptionsPageController", ['$scope', '$uibModal', 'httpService', 'alertService', function ($scope, $uibModal, httpService, alertService) {
		$scope.alertService = alertService;

		httpService.DataRootUrl = 'http://localhost';

		$scope.usersList = undefined;
		$scope.gettingUsers = false;

		$scope.logLevel = 1;

		$scope.print = function (message, obj) {
			if ($scope.logLevel > 0) {
				if (obj)
					console.log(message, obj);
				else
					console.log(message);
            }
        }

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

			$scope.print("getting users");

			chrome.storage.sync.get(["users"], function (result) {
				//debugger;

				$scope.gettingUsers = false;

				// check to make sure the users list exists
				if (result.users !== undefined) {
					$scope.print("found users: ", result.users);

					//debugger;

					$scope.$apply(function () {
						$scope.usersList = result.users;

						$scope.print("assigned users: ", $scope.usersList);
					});
					setAuthorTagClick();
				} else {
					$scope.print("no users found, resetting");

					var authorDetails = result || {};

					// create a new users list
					authorDetails.users = authorDetails.users || {};

					$scope.print("setting sync storage to: ", authorDetails);
					$scope.saveSGDatabase(authorDetails);
				}
			});
		}

		$scope.updateUsersData = function (usersList, ErrorCallback) {
			chrome.storage.sync.get(["users"], function (result) {
				//debugger;

				// check to make sure the users list exists
				if (result.users !== undefined) {
					$scope.print("found users: ", result.users);

					//debugger;

					result.users = usersList;

					$scope.saveSGDatabase(result);
				} else {
					$scope.print("no users found, resetting");

					ErrorCallback(result);
				}
			});

        }

		$scope.saveSGDatabase = function (sgDatabase, refreshUsers) {
			refreshUsers = refreshUsers || true;

			// write the new users list back out to sync storage
			chrome.storage.sync.set(sgDatabase, function () {
				//debugger;

				$scope.print("sync storage set complete");

				if (refreshUsers)
					$scope.getUsers();
			});		
		}

		$scope.deleteUser = function (user) {
			//debugger;

			if (confirm("This will delete all information for user [" + user + "]. Do you want to continue?")) {
				$scope.print("deleting [" + user + "] from list: ", $scope.usersList);

				delete $scope.usersList[user];

				$scope.print("updating sync storage");

				$scope.updateUsersData($scope.usersList);
			}
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
