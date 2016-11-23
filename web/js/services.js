angular.module('appname.services', [])
    .factory('ulhttp', function ($http, toastr) {
        return {
            handleError: function (result) {
                result = result.data;
                if (result.status !== 'OK') {
                    toastr.error(result.message);
                }
                return result;
            },
            post: function (url, data) {
                return $http.post(url, data);
            },
            get: function (url, data) {
                return $http.get(url, data);
            }
        };
    })
    .factory('logginService', function (ulhttp) {
        return {
            loggin: function (email, password) {
                var url = "/api/login";
                var data = {
                    email: email,
                    password: password
                };
                return ulhttp.post(url, data).then(function (result) {
                    result = ulhttp.handleError(result);
                    return result;
                });
            }
        };
    })
    .factory('logoutService', function (ulhttp, $rootScope, toastr, $location) {
        return {
            logout: function (email, password) {
                var url = "/api/logout";
                ulhttp.get(url).then(function (result) {
                    if (result.data.status === 'OK') {
                        toastr.success('Logged Out');
                        $location.path('/login');
                    } else {
                        toastr.error('Something went wrong');
                    }
                });
            }
        };
    })
    .factory('signupService', function (ulhttp) {
        return {
            signup: function (data) {
                var url = "/api/signup";
                return ulhttp.post(url, data).then(function (result) {
                    result = ulhttp.handleError(result);
                    return result;
                });
            }
        };
    })
    .factory('profileService', function (ulhttp) {
        return {
            getUserInfo: function (data) {
                var url = "/api/getuserinfo";
                return ulhttp.get(url, data).then(function (result) {
                    result = ulhttp.handleError(result);
                    return result;
                });
            }
        };
    }).factory('gameService', function (ulhttp) {
        return {
            // Align the clocks + get user info
            getUserInfo: function (data) {
                var url = "/api/game";
                return ulhttp.get(url, data).then(function (result) {
                    result = ulhttp.handleError(result);
                    return result;
                });
            },
            submitAnswer: function (data) {
                var url = "/api/submitAnswer?answer=" + data.answer;
                return ulhttp.get(url, data).then(function (result) {
                    result = ulhttp.handleError(result);
                    return result;
                });
            },

            getHint: function (data) {
                var url = "/api/getHint";
                return ulhttp.get(url, data).then(function (result) {
                    result = ulhttp.handleError(result);
                    return result;
                });

            },

            transfer: function (data) {
                // Content-Type: application/x-www-form-urlencoded
                var url = "/api/transferMoney";
                return ulhttp.post(url, data).then(function (result) {
                    result = ulhttp.handleError(result);
                    return result;
                });
            }
        };
    }).factory('leaderboardService', function (ulhttp) {
        return {
            getAllUserList: function (data) {
                var url = "/api/users";
                return ulhttp.get(url, data).then(function (result) {
                    result = ulhttp.handleError(result);
                    return result;
                });
            }
        };
    });