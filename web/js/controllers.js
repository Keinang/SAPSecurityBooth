angular.module('appname.controllers', [])
    .controller('BaseCtrl', ['$scope', 'logoutService', 'toastr', '$location', '$rootScope', function ($scope, logoutService, toastr, $location, $rootScope) {
        $scope.logout = function () {
            logoutService.logout();
        };
    }])
    .controller('tempCtrl', ['$scope', 'logginService', 'logoutService', 'toastr', '$rootScope', '$location', function ($scope, logginService, logoutService, toastr, $rootScope, $location) {
        $scope.login = function () {
            if ($scope.email && $scope.password) {
                logginService.loggin($scope.email, $scope.password).then(function (result) {
                    if (result.status === 'OK') {
                        $rootScope.currentUser = result.user;
                        $location.path('/profile');
                        toastr.success('Logged In');
                    }
                });
            } else {
                toastr.error('Must provide a valid email and password');
            }
        };
    }])
    .controller('signupCtrl', ['$scope', 'signupService', 'toastr', '$rootScope', '$location', function ($scope, signupService, toastr, $rootScope, $location) {
        $scope.signup = function () {
            if ($scope.firstName && $scope.lastName && $scope.email && $scope.password) {
                var data = {
                    email: $scope.email,
                    password: $scope.password,
                    firstName: $scope.firstName,
                    lastName: $scope.lastName
                };
                signupService.signup(data).then(function (result) {
                    if (result.status === 'OK') {
                        $rootScope.currentUser = result.user;
                        $location.path('/profile');
                    }
                });
            } else {
                toastr.error('All fields are required');
            }
        }

    }])
    .controller('leaderboardCtrl', ['$scope', 'leaderboardService', 'toastr', '$rootScope', function ($scope, leaderboardService, toastr, $rootScope) {
        $scope.getAllUserList = function () {
            leaderboardService.getAllUserList().then(function (result) {
                $scope.users = result.users;
                toastr.success('Got All users');
            });
        };
        $scope.getAllUserList();
    }])
    .controller('profileCtrl', ['$scope', 'profileService', '$rootScope', function ($scope, profileService, $rootScope) {
        $scope.getuserinfo = function () {
            profileService.getUserInfo().then(function (result) {
                if (result.status === 'OK') {
                    $scope.user = result.user;
                }
            });
        };
        $scope.getuserinfo();

    }]).controller('gameCtrl', ['$scope', 'gameService', 'toastr', '$rootScope', function ($scope, gameService, toastr, $rootScope) {
        $scope.isDebug = false;

        // when page is refreshed, init timer + questions
        $scope.getUserInfo = function (reRenderDigits) {
            gameService.getUserInfo().then(function (result) {
                $scope.user = result.user;
                if (result.status === 'OK') {
                    if (reRenderDigits) {
                        result.user.game.timeEnd = new Date(result.user.game.timeEnd);
                        showDigits(result.user.game.timeEnd, toastr);
                    }
                }
            });
        };

        // On user submit answer:
        $scope.submitAnswer = function () {
            var data = {
                answer: this.answerInput ? this.answerInput : null
            };
            gameService.submitAnswer(data).then(function (result) {
                if (result.status === 'OK') {
                    $scope.answerInput = ''; // reset answer
                    toastr.success(result.message);
                    $scope.getUserInfo(false); // ==> getUserInfo will manage all
                }
            });
        };

        $scope.forgetPassword = false;
        $scope.toggleForgetPassword = function () {
            $scope.forgetPassword = !$scope.forgetPassword;
        };

        $scope.getUserInfo(true);
    }]);

function showDigits(userTimeEnd, toastr) {
    var digits = angular.element(document.querySelector('.digits'));

    digits.countdown({
        image: "img/digits.png",
        format: "mm:ss",
        endTime: userTimeEnd,
        continuous: false,
        timerEnd: function () {
            toastr.error('Time is up');
        }
    });
}