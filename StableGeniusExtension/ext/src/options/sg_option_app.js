app
	.controller("OptionsPageController", ['$scope', '$uibModal', 'alertService', function ($scope, $uibModal, alertService) {
		// creates an automatic UIB alert at the bottom of the page
		$scope.alertService = alertService;

		// total users list
		$scope.usersList = undefined;
		// flag to use to show "Loading" spinner
		$scope.gettingUsers = false;
		// log levels: 0 = none, 1 = trace, 2 = debug
		$scope.logLevel = 1;

		$scope.settings = undefined;

		// hacked together print function to allow varying log levels
		$scope.print = function (message, obj) {
			if ($scope.logLevel > 0) {
				if (obj)
					console.log(message, obj);
				else
					console.log(message);
            }
        }

		// clear all the data from sync storage with warning message
		$scope.clearData = function () {
			if (confirm("This will clear all your StableGenius data. Are you sure you want to do this?")) {
				//debugger;

				chrome.storage.sync.clear(function () {
					$scope.getUsersData();
				});
			}
		}

		// get all the user data and set up page elements
		$scope.getUsersData = function () {
			$scope.usersList = null;
			$scope.gettingUsers = true;

			$scope.print("getting users");

			getUsers(function (result) {
					//debugger;

					$scope.gettingUsers = false;

					// check to make sure the users list exists
					if (result.users !== undefined) {
						//$scope.print("found users: ", result.users);

						//debugger;

						$scope.$apply(function () {
							$scope.usersList = result.users;

							//$scope.print("assigned users: ", $scope.usersList);
						});

						setAuthorTagClick();
					}
				},
				function (authorDetails) {
					alertService.addAlert("danger", "No users found!");

					$scope.print("no users found, setting sync storage to: ", authorDetails);
			});
		}

		$scope.updateSettingsData = function () {
			//debugger;

			updateSettings("settings", undefined, $scope.settings);
		};

		$scope.getSettingsData = function () {
			$scope.settings = null;

			getSettings("settings", function (result) {
				//$scope.print("settings found", result);

				if (result.settings !== undefined) {
					$scope.$apply(function () {
						$scope.settings = result.settings;
					});
				}
			},
				function (settingsDetails) {
					alertService.addAlert("danger", "No settings found!");

					settingsDetails.settings.changeButton = true;
					settingsDetails.settings.loginButtonText = "Submit";
					settingsDetails.settings.postCommentButtonText = "Submit";

					$scope.print("no settings found, setting sync storage to: ", settingsDetails);
				});
        }

		// save the user data back to sync storage
		$scope.updateUsersData = function (usersList, SuccessCallback) {
			updateUsers(usersList, function (result) {
				//$scope.print("found users: ", result.users);

				if (SuccessCallback)
					SuccessCallback(result);
			},
				function (result) {
					alertService.addAlert("danger", "No users found!")

					$scope.print("no users found, resetting, ", result);
			});
		}

		// delete a user from the database with confirmation and success messages
		$scope.deleteUser = function (user) {
			//debugger;

			if (confirm("This will delete all information for user [" + user + "]. Do you want to continue?")) {
				$scope.print("deleting [" + user + "] from list: ", $scope.usersList);

				delete $scope.usersList[user];

				$scope.print("updating sync storage");

				$scope.updateUsersData($scope.usersList, function (result) {
					alertService.addAlert("success", "Successfully deleted user");
				});
			}
		}

		// clear a user's recorded vote count with confirmation and success messages
		$scope.clearVoteCount = function (user) {
			if (confirm("This will clear all up and down votes for user [" + user + "]. Do you want to continue?")) {
				$scope.print("deleting [" + user + "] from list: ", $scope.usersList);

				$scope.usersList[user].voteValueUp = 0;
				$scope.usersList[user].voteValueDn = 0;

				$scope.print("updating sync storage");

				$scope.updateUsersData($scope.usersList, function (result) {
					alertService.addAlert("success", "Successfully cleared user's vote count");
				});
			}
		}

		// used for logic switching on front end
		$scope.getObjectPropertiesCount = function (objectProperty) {
			if (objectProperty === null)
				return -1;

			if (objectProperty === undefined)
				return -2;

			//debugger;

			return Object.getOwnPropertyNames(objectProperty).length;
		}

		// first thing, get all the data and display
		$scope.getUsersData();
		$scope.getSettingsData();
	}]);
