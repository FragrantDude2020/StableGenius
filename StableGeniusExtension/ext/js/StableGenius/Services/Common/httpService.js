angular.module("app")
    .factory('httpService', ['$http', function ($http) {
        var service = {};

        service.DataRootUrl = null;

        service.StandardHttpPostNoPreUrl = function (PostUrl, PostParameters, SuccessCallback, ErrorCallback, ServerErrorCallback, DisplayReturningData, DoReturnOfData, ReturnSuccessData) {
            return $http.post(PostUrl, PostParameters).then(
                function (data, status, headers, config) {
                    if (DisplayReturningData)
                        console.log(data);

                    //debugger;

                    if (data.data.Success === true) {
                        if (SuccessCallback) {
                            var successReturn = SuccessCallback(data.data);

                            if (ReturnSuccessData)
                                return successReturn;
                        }

                        if (DoReturnOfData)
                            return data;
                    } else {
                        if (data.data.GetException)
                            console.log("exception", data.data.GetException);

                        if (ErrorCallback)
                            ErrorCallback(data.data.GetException ? data.data.GetException.Message : undefined);
                    }
                },
                function (err_msg, err_code) {
                    console.log("err_msg", err_msg);
                    console.log("err_code", err_code);

                    if (ServerErrorCallback)
                        ServerErrorCallback(err_msg);
                }
            );
        };

        service.StandardHttpPost = function (PostUrl, PostParameters, SuccessCallback, ErrorCallback, ServerErrorCallback, DisplayReturningData, DoReturnOfData, ReturnSuccessData) {
            return $http.post(service.DataRootUrl + PostUrl, PostParameters).then(
                function (data, status, headers, config) {
                    if (DisplayReturningData)
                        console.log(data);

                    //debugger;

                    if (data.data.Success === true) {
                        if (SuccessCallback) {
                            var successReturn = SuccessCallback(data.data);

                            if (ReturnSuccessData)
                                return successReturn;
                        }

                        if (DoReturnOfData)
                            return data;
                    } else {
                        if (data.data.GetException)
                            console.log("exception", data.data.GetException);

                        if (ErrorCallback)
                            ErrorCallback(data.data.GetException ? data.data.GetException.Message : undefined);
                    }
                },
                function (err_msg, err_code) {
                    console.log("err_msg", err_msg);
                    console.log("err_code", err_code);

                    if (ServerErrorCallback)
                        ServerErrorCallback(err_msg);
                }
            );
        };

        service.StandardHttpGet = function (PostUrl, SuccessCallback, ErrorCallback, ServerErrorCallback, DisplayReturningData) {
            $http.get(service.DataRootUrl + PostUrl).then(
                function (data, status, headers, config) {
                    if (DisplayReturningData)
                        console.log(data);

                    if (data.data.Success === true) {
                        if (SuccessCallback)
                            SuccessCallback(data.data);
                    } else {
                        if (ErrorCallback)
                            ErrorCallback();
                    }
                },
                function (err_msg, err_code) {
                    console.log("err_msg", err_msg);
                    console.log("err_code", err_code);

                    var exceptionMessage = undefined;

                    if (err_msg.data && err_msg.data.GetException)
                    	exceptionMessage = err_msg.data.GetException.Message;

                    if (ServerErrorCallback)
                        ServerErrorCallback(err_msg, exceptionMessage);
                }
            );
        }

        service.ReturningHttpPost = function (PostUrl, PostParameters, SuccessCallback, ErrorCallback, ServerErrorCallback, DisplayReturningData) {
            return $http.post(service.DataRootUrl + PostUrl, PostParameters).then(
                function (data, status, headers, config) {
                    if (DisplayReturningData)
                        console.log(data);

                    if (data.data.Success === true) {
                        if (SuccessCallback)
                            return SuccessCallback(data.data);

                        return data;
                    } else {
                        if (ErrorCallback)
                            return ErrorCallback();

                        return null;
                    }
                },
                function (err_msg, err_code) {
                    console.log("err_msg", err_msg);
                    console.log("err_code", err_code);

                    var exceptionMessage = undefined;

                    if (err_msg.data.GetException)
                    	exceptionMessage = err_msg.data.GetException.Message;

                    if (ServerErrorCallback)
                        return ServerErrorCallback(err_msg, exceptionMessage);

                    return null;
                }
            );
        }

        service.ReturningHttpGet = function (PostUrl, SuccessCallback, ErrorCallback, ServerErrorCallback, DisplayReturningData) {
            return $http.get(service.DataRootUrl + PostUrl).then(
                function (data, status, headers, config) {
                    if (DisplayReturningData)
                        console.log(data);

                    if (data.data.Success === true) {
                        if (SuccessCallback)
                            return SuccessCallback(data.data);

                        return data;
                    } else {
                        if (ErrorCallback)
                            return ErrorCallback();

                        return null;
                    }
                },
                function (err_msg, err_code) {
                    console.log("err_msg", err_msg);
                    console.log("err_code", err_code);

                    var exceptionMessage = undefined;

                    if (err_msg.data.GetException)
                    	exceptionMessage = err_msg.data.GetException.Message;

                    if (ServerErrorCallback)
                        return ServerErrorCallback(err_msg, exceptionMessage);

                    return null;
                }
            );
        }

        return service;
    }]);
