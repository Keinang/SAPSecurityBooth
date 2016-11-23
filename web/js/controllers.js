angular.module('appname.controllers', ['ngAnimate'])
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
                var canvas = document.getElementById("myCanvas");
                // Make it visually fill the positioned parent
                canvas.style.width = '100%';
                canvas.style.height = '100%';
                // ...then set the internal size to match
                canvas.width = canvas.offsetWidth;
                canvas.height = canvas.offsetHeight;

                $('#catchMeDiv').hide();
                $('.navbar').hide();
                $('#userList ul').empty();
                $('#userList').css("background-color", "rgba(0, 0, 0, 0)");
                $('#myCanvas').css("background-image", "url('img/anonymous.jpg')");
                $('#myCanvas').css("opacity", "0.6");

                for (var i = 0; i < $scope.users.length; i++) {
                    // Score:
                    var score = $scope.users[i]["game"]["score"];
                    if (score === 0) { // bug with tagcloud
                        score = 1;
                    }

                    var item = '<a href="#/leaderboard" data-weight="' + (score + 15) + '">' + (i + 1) + '. ' + $scope.users[i]["firstName"] + ' ' + $scope.users[i]["lastName"] + ' : ' + score + "</a>";
                    $('#userList ul').append(item);
                }

                //window.onload = function() {
                try {
                    TagCanvas.Start('myCanvas', 'userList', {
                        reverse: true,
                        depth: 0.8,
                        maxSpeed: 0.01,
                        noMouse: true,
                        initial: [0.2, 0.2],
                        weight: true,
                        weightFrom: "data-weight",
                        textFont: 'Impact,Arial Black,sans-serif;',
                        textHeight: 25,
                        weightMode: "both",
                        textColour: "white",
                        weightGradient: {0: '#C58C33', 0.66: '#fff', 1: '#fff'},
                        zoom: 1
                    });
                } catch (e) {
                    // something went wrong, hide the canvas container
                    console.log(e.message);
                    document.getElementById('myCanvas').style.display = 'none';
                }
                //};

            });
        };

        $scope.start = function () {

            setTimeout(function () {
                $scope.getAllUserList();
                $scope.start();
            }, 30000); // milliseconds
        };

        $scope.start();
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

    }])
    .controller('aboutCtrl', ['$scope', '$rootScope', function ($scope, $rootScope) {

    }])
    .controller('helpCtrl', ['$scope', '$rootScope', function ($scope, $rootScope) {

    }])
    .controller('leaderboard2Ctrl', ['$scope', '$rootScope', 'leaderboardService', 'toastr', function ($scope, $rootScope, leaderboardService, toastr) {
        var FakePoller = function (options, callback) {
            var defaults = {
                frequency: 60,
                limit: 10
            };
            this.callback = callback;
            this.config = $.extend(defaults, options);
        };

        FakePoller.prototype.processData = function () {
            leaderboardService.getAllUserList().then(function (result) {
                $scope.users = result.users;
            });
        };

        FakePoller.prototype.start = function () {
            var _this = this;
            this.interval = setInterval((function () {
                _this.callback(_this.processData());
            }), 8 * 1000);
            this.callback(this.processData());
            return this;
        };
        FakePoller.prototype.stop = function () {
            clearInterval(this.interval);
            return this;
        };
        window.FakePoller = FakePoller;

        var Leaderboard = function (elemId, options) {
            var _this = this;
            var defaults = {
                limit: 10,
                frequency: 15
            };
            this.currentItem = 0;
            this.currentCount = 0;
            this.config = $.extend(defaults, options);

            this.$elem = $(elemId);
            if (!this.$elem.length)
                this.$elem = $('<div>').appendTo($('body'));

            this.list = [];
            this.$content = $('<ul>');
            this.$elem.append(this.$content);

            this.poller = new FakePoller({frequency: this.config.frequency, limit: this.config.limit}, function (data) {
                if ($scope.users) {
                    _this.buildElements(_this.$content, $scope.users.length);
                    _this.currentCount = $scope.users.length;
                }
            });

            this.poller.start();
        };

        Leaderboard.prototype.buildElements = function ($ul, elemSize) {
            $ul.empty();
            this.list = [];

            for (var i = 0; i < elemSize; i++) {
                var item = $('<li>')
                    .appendTo($ul);

                var user = $scope.users[i];
                if (user.game.timeUserFinished === undefined) {
                    user.game.timeUserFinished = new Date(); // still playing
                }
                var diffMs = (new Date(user.game.timeUserFinished) - new Date(user.game.timeStart));
                var minutes = Math.floor(diffMs / 60000);
                var seconds = ((diffMs % 60000) / 1000).toFixed(0);
                if (minutes >= 15) {
                    minutes = 15;
                    seconds = 0;
                }
                var totalTime = minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
                this.list.push({
                    $item: item,
                    $name: $('<span class="name" >' + user.firstName + ' ' + user.lastName + '</span>').appendTo(item),
                    $value: $('<span class="count" style="color: yellowgreen;">' + user.game.score + ' (Level: ' + user.game.level + '; Time: ' + totalTime + ')</span>').appendTo(item)
                });
            }
        };


        // Calling for data for the 1st time:
        leaderboardService.getAllUserList().then(function (result) {
            $scope.users = result.users;

            var answerInputDiv = angular.element(document.querySelector('.content'));
            new Leaderboard(answerInputDiv[0], {limit: 8, frequency: 8});
        });
    }])
    .controller('gameCtrl', ['$scope', '$timeout', 'logoutService', 'gameService', 'toastr', '$rootScope', function ($scope, $timeout, logoutService, gameService, toastr, $rootScope) {
        // when page is refreshed, init timer + questions
        $scope.getUserInfo = function (reRenderDigits) {
            gameService.getUserInfo().then(function (result) {
                $scope.user = result.user;
                setUiHints($scope);
                if (result.status === 'OK') {
                    // Send usage analytics:
                    ga('send', 'pageview', '/game' + result.user.game.level + '.html');

                    // Reset answer:
                    var answerInputDiv = angular.element(document.querySelector('#answerInput'));
                    answerInputDiv[0].value = '';

                    // Re-render time:
                    if (reRenderDigits) {
                        result.user.game.timeEnd = new Date(result.user.game.timeEnd);
                        showDigits(result.user.game.timeEnd, toastr);
                    }
                }
            });
        };

        // On user submit answer:
        $scope.submitAnswer = function () {
            var answerInputDiv = angular.element(document.querySelector('#answerInput'));
            var data = {
                answer: answerInputDiv[0].value
            };
            gameService.submitAnswer(data).then(function (result) {
                if (result.status === 'OK') {
                    toastr.success(result.message);
                    $scope.getUserInfo(false); // ==> getUserInfo will manage all
                }
                else {
                    $scope.wrongAnswer = true;
                    $timeout(function () {
                        $scope.wrongAnswer = false;
                    }, 2000);
                }
            });
        };

        // On user getting hint:
        $scope.getHint = function () {
            gameService.getHint().then(function (result) {
                $scope.user = result.user;
                setUiHints($scope);
            })
        };

        $scope.transfer = function () {
            var myAccountLabel = angular.element(document.querySelector('#accountNumber'));
            var myAmountInput = angular.element(document.querySelector('#amount'));
            if (myAccountLabel[0].textContent) {
                var data = {
                    accountNumber: myAccountLabel[0].textContent,
                    amount: myAmountInput[0].value
                };
                gameService.transfer(data).then(function (result) {
                    if (result.status === 'OK') {

                        //toastr.success('Great Success! Check response for confirmation key to proceed');
                        toastr.success(result.message);
                        setConfirmationToken($scope, true, result.confKey);
                    }
                    else if (result.status === 'idle') {
                        toastr.success('Money successfully transferred!');
                    }
                });
            } else {
                toastr.error('Please provide amount to transfer');
            }
        };

        $scope.showModalCh2 = false;
        $scope.toggleRecoveryQuestion = function () {
            $scope.showModalCh2 = !$scope.showModalCh2;
        };

        $scope.showPicture = function () {
            $scope.ShowPic = true;
            $timeout(function () {
                $scope.ShowPic = false;
            }, 2000);
        };
        // logout when time is up
        $scope.checkUserTime = function () {
            if ($scope.user.game.timeEnd !== undefined && new Date($scope.user.game.timeEnd) - new Date() < 0) {
                // times up -> logout.
                logoutService.logout();
                return false;
            }
            return true;
        };

        $scope.startCheckTime = function () {
            setTimeout(function () {
                if ($scope.checkUserTime()) {
                    $scope.startCheckTime();
                }

            }, 5000);
        };

        $scope.startCheckTime();
        document.location.href = "#"; // scroll up
        $scope.getUserInfo(true);

        $scope.onToggleButtonCH1 = function () {
            $("#toggleButtonCH1").css({
                left: (Math.random() * 400) + "px",
                top: (Math.random() * 400) + "px"
            });
        }
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

function setUiHints(scope) {
    scope.isHintDisabled = !scope.user.game.hasMoreHints;
}

function setConfirmationToken(scope, confirmation, confK) {
    scope.confirmationToken = true;
    scope.confKey = confK;
}