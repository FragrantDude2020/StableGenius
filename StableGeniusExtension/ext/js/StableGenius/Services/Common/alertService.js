angular.module('app')
    .factory('alertService', function () {
        var service = {};

        service.alerts = [];

        service.addAlert = function (type, message) {
            //debugger;
            if (message)
                service.alerts.push({ msg: message, type: type || "warning" });
        };

        service.closeAlert = function (index) {
            service.alerts.splice(index, 1);
        };

        return service;
    });
