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

                $('#myCanvas ul').empty();
                for (var i = 0; i < $scope.users.length; i++) {
                    // Score:
                    var score = $scope.users[i]["game"]["score"];
                    if (score === 0) { // bug with tagcloud
                        score = 1;
                    }

                    var item = '<a href="#/leaderboard" data-weight="' + score + '">' + $scope.users[i]["firstName"] + ' ' + $scope.users[i]["lastName"] + '(' + score + ')' + "</a>";
                    $('#myCanvas ul').append(item);
                }

                var gradient = {
                    17: '#f00', // red
                    0.33: '#ff0', // yellow
                    0.5: 'orange', // orange
                    0.66: '#0f0', // green
                    1: '#00f' // blue
                };
                $('#myCanvas').tagcanvas({
                    weightGradient: gradient,
                    weight: true,
                    weightFrom: 'data-weight',
                    shadow: '#ccf',
                    shadowBlur: 3,
                    interval: 20,
                    textFont: 'Impact,Arial Black,sans-serif',
                    textColour: '#82797B',
                    textHeight: 14,
                    outlineColour: '#F2F0F0',
                    outlineThickness: 5,
                    maxSpeed: 0.1,
                    minBrightness: 0.1,
                    depth: 0.92,
                    pulsateTo: 0.2,
                    pulsateTime: 0.75,
                    initial: [0.1, -0.1],
                    decel: 0.98,
                    reverse: true,
                    hideTags: false
                }, 'weightTags');
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

        var Main = (function () {
            function Main() {
                this.vars();
                this.fixIEPatterns();
                this.launchTrains();
                this.launchClouds();
                this.animate();
            }

            Main.prototype.vars = function () {
                var cabin, i, _i, _j;
                this.train1 = {
                    cabins: [],
                    path: document.getElementById('js-blue-path')
                };
                for (i = _i = 1; _i <= 5; i = ++_i) {
                    if (cabin = document.getElementById("js-blue-train-cabin" + i)) {
                        this.train1.cabins.push(cabin);
                    }
                }
                this.cabinWidth = 2.5 * this.train1.cabins[0].getBoundingClientRect().width;
                this.train2 = {
                    cabins: [],
                    path: document.getElementById('js-yellow-path')
                };
                for (i = _j = 1; _j <= 5; i = ++_j) {
                    if (cabin = document.getElementById("js-yellow-train-cabin" + i)) {
                        this.train2.cabins.push(cabin);
                    }
                }
                this.cabinWidth = 90;
                this.childNode = this.isIE() ? 1 : 0;
                this.childMethod = this.isIE() ? 'childNodes' : 'children';
                return this.animate = this.bind(this.animate, this);
            };

            Main.prototype.fixIEPatterns = function () {
                if (!this.isIE()) {
                    return;
                }
                this.addImageToPattern({
                    pattern: 'pattern2',
                    image: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/6859/pattern2.png'
                });
                this.addImageToPattern({
                    pattern: 'pattern3',
                    image: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/6859/pattern3.png'
                });
                this.addImageToPattern({
                    pattern: 'pattern4',
                    image: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/6859/pattern4.png'
                });
                return this.addImageToPattern({
                    pattern: 'pattern5',
                    image: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/6859/pattern5.png'
                });
            };

            Main.prototype.addImageToPattern = function (o) {
                var pattern, receptacle, svgfragment;
                pattern = document.getElementById(o.pattern);
                console.log(pattern);
                receptacle = document.createElement('div');
                svgfragment = "<svg>\n  <image\n    xmlns=\"http://www.w3.org/2000/svg\"\n    width=\"108px\"\n    height=\"108px\"\n    xlink:href=\"" + o.image + "\"\n  />\n</svg>";
                receptacle.innerHTML = '' + svgfragment;
                return Array.prototype.slice.call(receptacle.childNodes[0].childNodes).forEach(function (el) {
                    return pattern.appendChild(el);
                });
            };

            Main.prototype.launchClouds = function () {
                var cloud1, cloud11, cloud2, cloud21, cloud3, cloud31, cloud4, cloud41, cloudEnd, cloudStart, it, time;
                it = this;
                cloudStart = 3200;
                cloudEnd = -400;
                cloud1 = document.getElementById('js-cloud1');
                cloud11 = document.getElementById('js-cloud11');
                time = 90000;
                this.cloud1Tween = new TWEEN.Tween({
                    left: cloudStart
                }).to({
                        left: cloudEnd
                    }, time).onUpdate(function () {
                        //return cloud1.setAttribute('transform', "translate(" + this.left + ")");
                    }).repeat(9999999).start({
                        progress: .65
                    });
                this.cloud11Tween = new TWEEN.Tween({
                    left: cloudStart
                }).to({
                        left: cloudEnd
                    }, time).onUpdate(function () {
                        //return cloud11.setAttribute('transform', "translate(" + this.left + ")");
                    }).repeat(9999999).delay(time / 2).start({
                        progress: .65
                    });
                cloud2 = document.getElementById('js-cloud2');
                cloud21 = document.getElementById('js-cloud21');
                time = 75000;
                this.cloud2Tween = new TWEEN.Tween({
                    left: cloudStart
                }).to({
                        left: cloudEnd
                    }, time).onUpdate(function () {
                        //return cloud2.setAttribute('transform', "translate(" + this.left + ")");
                    }).repeat(9999999).start({
                        progress: .25
                    });
                this.cloud21Tween = new TWEEN.Tween({
                    left: cloudStart
                }).to({
                        left: cloudEnd
                    }, time).onUpdate(function () {
                        //return cloud21.setAttribute('transform', "translate(" + this.left + ")");
                    }).repeat(9999999).delay(time / 2).start({
                        progress: .25
                    });
                cloud3 = document.getElementById('js-cloud3');
                cloud31 = document.getElementById('js-cloud31');
                time = 100000;
                this.cloud3Tween = new TWEEN.Tween({
                    left: cloudStart
                }).to({
                        left: cloudEnd
                    }, time).onUpdate(function () {
                        //return cloud3.setAttribute('transform', "translate(" + this.left + ")");
                    }).repeat(9999999).start({
                        progress: .75
                    });
                this.cloud31Tween = new TWEEN.Tween({
                    left: cloudStart
                }).to({
                        left: cloudEnd
                    }, time).onUpdate(function () {
                        //return cloud31.setAttribute('transform', "translate(" + this.left + ")");
                    }).repeat(9999999).delay(time / 2).start({
                        progress: .75
                    });
                cloud4 = document.getElementById('js-cloud4');
                cloud41 = document.getElementById('js-cloud41');
                time = 110000;
                this.cloud4Tween = new TWEEN.Tween({
                    left: cloudStart
                }).to({
                        left: cloudEnd
                    }, time).onUpdate(function () {
                        //return cloud4.setAttribute('transform', "translate(" + this.left + ")");
                    }).repeat(9999999).start();
                return this.cloud41Tween = new TWEEN.Tween({
                    left: cloudStart
                }).to({
                        left: cloudEnd
                    }, time).onUpdate(function () {
                        //return cloud41.setAttribute('transform', "translate(" + this.left + ")");
                    }).repeat(9999999).delay(time / 2).start();
            };

            Main.prototype.launchTrains = function () {
                var it;
                it = this;
                this.train1Tween = new TWEEN.Tween({
                    length: this.train1.path.getTotalLength()
                }).to({
                        length: 0
                    }, 8000).onUpdate(function () {
                        var angle, attr, cabin, cabinChild, i, point, prevPoint, shift, x, x1, x2, y, _i, _len, _ref, _results;
                        _ref = it.train1.cabins;
                        _results = [];
                        for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
                            cabin = _ref[i];
                            shift = i * it.cabinWidth;
                            point = it.train1.path.getPointAtLength(this.length - shift);
                            prevPoint = it.train1.path.getPointAtLength(this.length - shift - 1);
                            x1 = point.y - prevPoint.y;
                            x2 = point.x - prevPoint.x;
                            angle = Math.atan(x1 / x2) * (180 / Math.PI);
                            x = point.x - 30;
                            y = point.y - 54;
                            if (point.x - prevPoint.x > 0) {
                                if (!cabin.isRotated) {
                                    cabinChild = cabin[it.childMethod][it.childNode];
                                    cabinChild.setAttribute('xlink:href', '#cabin2');
                                    cabin.isRotated = true;
                                }
                            } else {
                                if (cabin.isRotated) {
                                    cabinChild = cabin[it.childMethod][it.childNode];
                                    cabinChild.setAttribute('xlink:href', '#cabin1');
                                    cabin.isRotated = false;
                                }
                            }
                            attr = "translate(" + x + ", " + y + ") rotate(" + (angle || 0) + ",38,23)";
                            _results.push(cabin.setAttribute('transform', attr));
                        }
                        return _results;
                    }).repeat(999999999999).start();
                return this.train2Tween = new TWEEN.Tween({
                    length: this.train2.path.getTotalLength()
                }).to({
                        length: 0
                    }, 5000).onUpdate(function () {
                        var angle, attr, cabin, cabinChild, i, point, prevPoint, shift, x, x1, x2, y, _i, _len, _ref, _results;
                        _ref = it.train2.cabins;
                        _results = [];
                        for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
                            cabin = _ref[i];
                            shift = i * it.cabinWidth;
                            point = it.train2.path.getPointAtLength(this.length - shift);
                            prevPoint = it.train2.path.getPointAtLength(this.length - shift - 1);
                            x1 = point.y - prevPoint.y;
                            x2 = point.x - prevPoint.x;
                            angle = Math.atan(x1 / x2) * (180 / Math.PI);
                            x = point.x - 50;
                            y = point.y - 54;
                            if (point.x - prevPoint.x > 0) {
                                if (!cabin.isRotated) {
                                    cabinChild = cabin[it.childMethod][it.childNode];
                                    cabinChild.setAttribute('xlink:href', '#cabin2');
                                    cabin.isRotated = true;
                                }
                            } else {
                                if (cabin.isRotated) {
                                    cabinChild = cabin[it.childMethod][it.childNode];
                                    cabinChild.setAttribute('xlink:href', '#cabin1');
                                    cabin.isRotated = false;
                                }
                            }
                            attr = "translate(" + x + ", " + y + ") rotate(" + (angle || 0) + ",38,23)";
                            _results.push(cabin.setAttribute('transform', attr));
                        }
                        return _results;
                    }).repeat(999999999999).start();
            };

            Main.prototype.animate = function () {
                requestAnimationFrame(this.animate);
                return TWEEN.update();
            };

            Main.prototype.isIE = function () {
                var msie, rv, rvNum, trident, ua, undef;
                if (this.isIECache) {
                    return this.isIECache;
                }
                undef = void 0;
                rv = -1;
                ua = window.navigator.userAgent;
                msie = ua.indexOf("MSIE ");
                trident = ua.indexOf("Trident/");
                if (msie > 0) {
                    rv = parseInt(ua.substring(msie + 5, ua.indexOf(".", msie)), 10);
                } else if (trident > 0) {
                    rvNum = ua.indexOf("rv:");
                    rv = parseInt(ua.substring(rvNum + 3, ua.indexOf(".", rvNum)), 10);
                }
                this.isIECache = (rv > -1 ? rv : undef);
                return this.isIECache;
            };

            Main.prototype.bind = function (func, context) {
                var bindArgs, wrapper;
                wrapper = function () {
                    var args, unshiftArgs;
                    args = Array.prototype.slice.call(arguments);
                    unshiftArgs = bindArgs.concat(args);
                    return func.apply(context, unshiftArgs);
                };
                bindArgs = Array.prototype.slice.call(arguments, 2);
                return wrapper;
            };

            return Main;

        })();

        // Calling for data for the 1st time:
        leaderboardService.getAllUserList().then(function (result) {
            $scope.users = result.users;

            new Main;
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

                        toastr.success('Great Success! Check response for confirmation key to proceed');
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

        // logout when time is up
        $scope.checkUserTime = function () {
            if ($scope.user.game.timeEnd !== undefined && new Date($scope.user.game.timeEnd) - new Date() < 0) {
                // times up -> logout.
                logoutService.logout();
                return false;
            }
            return true;
        };

        $scope.startCheckTime = function(){
            setTimeout(function () {
                if ($scope.checkUserTime()){
                    $scope.startCheckTime();
                }

            }, 5000);
        };

        $scope.startCheckTime();
        document.location.href = "#"; // scroll up
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

function setUiHints(scope) {
    scope.isHintDisabled = !scope.user.game.hasMoreHints;
}

