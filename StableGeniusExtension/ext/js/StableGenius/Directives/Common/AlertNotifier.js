angular.module("app").controller('AlertNotifierController',
    function ($scope, alertFactory) {
        $scope.alertFactory = alertFactory;
    })
    .directive('alertNotifier', function () {
        return {
            restrict: 'E',
            controller: 'AlertNotifierController',
            templateUrl: "Templates/AlertNotifier.html"
        };
    });