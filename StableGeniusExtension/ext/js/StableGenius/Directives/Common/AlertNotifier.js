angular.module("app").controller('AlertNotifierController', ['$scope', 'alertService', function ($scope, alertService) {
    $scope.alertService = alertService;
}])
.directive('alertNotifier', function () {
    return {
        restrict: 'E',
        controller: 'AlertNotifierController',
        templateUrl: "/js/StableGenius/Directives/Common/Templates/AlertNotifier.html"
    };
});