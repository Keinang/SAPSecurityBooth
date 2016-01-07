module.exports = function (app, passport) {
    var user = require('../app/models/user');

    var TIME_PLAY_IN_MINUTES = 15;
    var Answers = {
        '1': '271083',
        '2': 'San Jose Sharks',
        '3': '3',
        '4': '4',
        '5': '5'
    };

    var Questions = {
        '1': "The bank is closed today. Your mission is to find the Bank's door lock code",
        '2': "You want to deliver money to your account. Login as the Bank owner, Hasso Plattner. Your mission is to find Hasso's password",
        '3': '3 question',
        '4': '4 question',
        '5': '5 question'
    };

    var Hints = {
        '1': ['A simple challenge, involving an to fill a password hidden. Requirements: Common sense.', 'View source'],
        '2': ['A slightly more difficult challenge, involving social engineering. Requirements: Common sense.'],
        '3': ['hint 3'],
        '4': ['hint 4'],
        '5': ['hint 5']
    };

    var LevelScore = {
        1: 100,
        2: 1000,
        3: 1000,
        4: 1000,
        5: 10000
    };

// LOGOUT ==============================
    app.get('/api/logout', function (req, res) {
        req.logout();
        res.json(200, {
            status: 'OK',
            message: 'Logged Out'
        });
    });

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

// locally --------------------------------
// LOGIN ===============================
// process the login form
    app.post('/api/login', function handleLocalAuthentication(req, res, next) {//Utilizing custom callback to send json objects
        passport.authenticate('local-login', function (err, user, message) {
            if (err) {
                return next(err);
            }
            var response = {};
            if (!user) {
                response.status = 'ERROR';
                response.message = message;
                return res.json(200, response);
            }

            // Manually establish the session...
            req.login(user, function (err) {
                if (err) {
                    return next(err);
                }
                response.status = 'OK';
                response.user = user;
                return res.json(200, response);
            });

        })(req, res, next);
    });

// SIGNUP =================================
// process the signup form
// app.post('/api/signup', passport.authenticate('local-signup'), function(req,res){
//     res.json(req.user);
// });
    app.post('/api/signup', function handleLocalAuthentication(req, res, next) { //Utilizing custom callback to send json objects
        passport.authenticate('local-signup', function (err, user, message) {
            if (err) {
                return next(err);
            }
            var response = {};
            if (!user) {
                response.status = 'ERROR';
                response.message = message;
                return res.json(200, response);
            }
            // Manually establish the session...
            req.login(user, function (err) {
                if (err) {
                    return next(error);
                }
                response.status = 'OK';
                response.user = user;
                return res.json(200, response);
            });
        })(req, res, next);
    });

    app.get('/api/loggedin', function (req, res) {
        res.send(req.isAuthenticated() ? req.user : '0');
    });

    app.get('/api/getuserinfo', isLoggedIn, function (req, res) {
        var user_id = req.user._id;
        user.findOne({_id: user_id}, function (error, user) {
            var response = {};
            if (!error) {
                response.status = 'OK';
                response.user = user;
                res.json(200, response);
            } else {
                response.status = 'ERROR';
                response.message = 'Something Went Wrong';
                res.json(200, response);
            }
        });
    });

// =============================================================================
// For Leaderboard =============================================================
// =============================================================================
    app.get('/api/users', function (req, res) {
        user.find({}, function (err, users) {
            var userMap = {};

            users.forEach(function (user) {
                userMap[user._id] = removeSensitiveInfo(user);
            });

            var response = {};
            response.status = 'OK';
            response.users = users;
            res.json(200, response);
        });
    });

    function removeSensitiveInfo(user) {
        user.local = undefined;
        user._doc.game.hints = undefined;
        user._doc.game.question = undefined;
        return user;
    }

// =============================================================================
// Game ROUTES =================================================================
// =============================================================================
    app.get('/api/game', isLoggedIn, function (req, res) {
        var user_id = req.user._id;

        // Find user:
        user.findOne({_id: user_id}, function (error, user) {
            var response = {};
            if (error) {
                responseWrapper(response, res, 'ERROR', 'Something Went Wrong - no user found', user);
                return;
            }

            setGameLevelDetails(user);

            if (user.game && user.game.timeEnd && (user.game.timeEnd - new Date() < 0)) {
                responseWrapper(response, res, 'ERROR', 'Times up!', user);
            } else {
                responseWrapper(response, res, 'OK', 'Game Details Returned', user);
            }
        });
    });

    app.get('/api/submitAnswer', isLoggedIn, function (req, res) {
        var user_id = req.user._id;

        // Find user:
        user.findOne({_id: user_id}, function (error, user) {
            var response = {};
            if (error) {
                responseWrapper(response, res, 'ERROR', 'Something Went Wrong - no user found');
                return;
            }

            var isRight = (req.query) && checkAnswer(req.query.answer, user.game.level, user);
            response.user = user;
            if (isRight) {
                responseWrapper(response, res, 'OK', 'Good answer', user);
            } else {
                responseWrapper(response, res, 'ERROR', 'Wrong answer', user);
            }
        });
    });

    function setGameLevelDetails(user) {
        // init questions, hints and clock:
        if (user.game === undefined || user.game.timeEnd === undefined) {
            initUserGameClock(user);
        }

        user._doc.game.hints = Hints[user.game.level];
        user._doc.game.question = Questions[user.game.level];
    }

    function initUserGameClock(user) {
        user.game = {
            level: 1,
            score: 0,
            timeEnd: new Date(new Date().getTime() + TIME_PLAY_IN_MINUTES * 60000),
            hints: [],
            question: ''
        };
        user.save();
    }

    function checkAnswer(answer, level, user) {
        var isCorrect = (Answers[level].toLowerCase() == answer.toLowerCase());
        if (isCorrect) {
            // set level:
            user.game.level = user.game.level + 1;

            // set score:
            var diffMs = (user.game.timeEnd - new Date());
            var diffMins = diffMs < 0 ? 0 : Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
            var scoreFactor = LevelScore[user.game.level];
            scoreFactor = Number.isInteger(scoreFactor) ? scoreFactor : 0;
            user.game.score += diffMins * scoreFactor;

            // save:
            user.save();
        }
        return isCorrect;
    }
};

// =============================================================================
// Helpers =====================================================================
// =============================================================================

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.send('you are not logged in');
    }
}

function responseWrapper(response, res, status, message, user) {
    response.user = user;
    response.status = status;
    response.message = message;
    res.json(200, response);
}