module.exports = function (app, passport) {
    var user = require('../app/models/user');
    var http = require('http');

    var TIME_PLAY_IN_MINUTES = 15;
    var ch4ExpectedMoney = 1000000;
    var ch4ExpectedAccount = 424242;
    var Answers = {
        '1': 'sharks',
        '2': '271083',
        '3': 'Carlos Slim', // https://www.base64encode.org/
        '4': 'n00b',
        '5': '5555555' // solution: document.cookie="isAdmin=true"
    };

    var Questions = {
        '1': "You entered the bank. Log in as Hasso Plattner.",
        '2': "Inside the bank there is an internal computer to transfer funds inside a locked room. Your mission is to find the door lock code hidden somewhere in front of the page.",
        '3': "You found the bank account information file, but unfortunately it is not readable. You need to find the account name with the most amount.",
        '4': 'Transfer 1 Million dollars to your account number: 424242',
        '5': 'Remove the log from the server.'
    };

    var Hints = {
        '1': ['Change the HTML to remove onmouseover and any button style','Did you check to whom the forgotten password question was sent?', 'Use social engineering knowledge to discover the password.', 'Did you read Hasso\'s wikipedia page?'],
        '2': ['Did you try to select all content in the page?'],
        '3': ['https://www.base64decode.org/','Can you understand the encryption method?', 'Try to decode it and find the biggest value.', 'base64 would be useful here.'],
        '4': ['If you post it...It will come....', 'Try to tamper with the data as needed.'],
        '5': ['What is common to Oreo, chocolate chips and what grandmothers give to their grandsons?', 'Can you change the value of the cookie?', 'The cookie key is isAdmin']
    };

    var LevelScore = {
        1: 1,
        2: 2,
        3: 4,
        4: 8,
        5: 16
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

                // send counter plus one
                plusOne(user);

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
                    return next(err);
                }
                response.status = 'OK';
                response.user = user;

                // send counter plus one
                plusOne(user);

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
            var byScore = users.slice(0);
            byScore.sort(function (a, b) {
                return b.game.score - a.game.score;
            });

            response.users = byScore;
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
                responseWrapper(response, res, 'ERROR', 'Something went wrong - no user found');
                return;
            }
            var isRight = (req.query) && checkAnswer(req.query.answer, req.cookies, user.game.level, user);

            response.user = user;
            if (isRight) {
                // Reached level 5:
                if (user.game.level === 5) {
                    // Set cookie for level 5
                    res.cookie('isAdmin', 'false');
                }
                // Reached level 6:
                if (user.game.level === 6) {
                    // Clear cookie for level 6
                    res.clearCookie('isAdmin');
                }
                responseWrapper(response, res, 'OK', 'Good answer', user);
            } else {
                var message = 'Wrong answer';
                if (user.game.level === 5) {
                    message = 'Access denied! Only administrators can delete the log';
                }
                responseWrapper(response, res, 'ERROR', message, user);
            }
        });
    });

    app.get('/api/getHint', isLoggedIn, function (req, res) {
        var user_id = req.user._id;

        // Find user:
        user.findOne({_id: user_id}, function (error, user) {
            var response = {};
            if (error) {
                responseWrapper(response, res, 'ERROR', 'Something Went Wrong - no user found');
                return;
            }
            setHint(user);
            setGameLevelDetails(user);

            user.save();
            response.user = user;
            responseWrapper(response, res, 'OK', 'Game Hints Returned', user);
        });
    });

    app.post('/api/transferMoney', function (req, res) { //Utilizing custom callback to send json objects
        var response = {};

        if (req.body.accountNumber == ch4ExpectedAccount) {
            if (req.body.amount == ch4ExpectedMoney) {
                //setUserScoreAndLevel(user);
                response.status = 'OK';
                response.message = 'You transferred 1M$! Enter the confirmation key to proceed to level 5...';
                //response.confirmationKey = Answers['4'];
				response.confirmationToken = true;
				response.confKey = 'Your confirmation key is:' + Answers['4'];
                return res.json(200, response);
            } else {
                // wrong money
                response.status = 'ERROR';
                response.message = 'Your account number is good, but you should transfer 1M$....';
                return res.json(200, response);
            }
        } else if (req.body.amount == ch4ExpectedMoney) {
            // wrong account
            response.status = 'ERROR';
            response.message = 'Sending 1M$... ERROR! Account does not exist...';
            return res.json(200, response);
        } else {
            // the user didn't change anything...
            response.status = 'ERROR';
            response.message = 'You need to transfer the money to your account: 424242....';
            return res.json(200, response);
        }

    });

    function setGameLevelDetails(user) {
        // init questions, hints and clock:
        if (user.game === undefined || user.game.timeEnd === undefined) {
            initUserGameClock(user);
        }
        user._doc.game.question = Questions[user.game.level];
    }

    function setHint(user) {
        var allHints = Hints[user.game.level];
        var usedHints = user.game.hints;

        if (usedHints.length < allHints.length) {
            // Set the additional hint
            usedHints.push(allHints[usedHints.length]);
        }
        // Set hints status
        if (usedHints.length < allHints.length) {
            user.game.hasMoreHints = true;
        } else {
            user.game.hasMoreHints = false;
        }
    }

    function initUserGameClock(user) {
        user.game = {
            level: 1,
            score: 0,
            timeEnd: new Date(new Date().getTime() + TIME_PLAY_IN_MINUTES * 60000),
            timeStart: new Date(),
            hints: [],
            hasMoreHints: true,
            question: ''
        };
        user.save();
    }

    function checkAnswer(answer, cookies, level, user) {
        var isCorrect;
        if (user.game.level == 5) {
            isCorrect = (cookies.isAdmin === 'true');
        } else {
            isCorrect = (Answers[level].toLowerCase().trim() == answer.toLowerCase().trim());
        }
        if (isCorrect) {
            // set level:
            setUserScoreAndLevel(user);
        }
        return isCorrect;
    }

    function setUserScoreAndLevel(user) {
        user.game.level = user.game.level + 1;

        // set score:
        var diffMs = (user.game.timeEnd - new Date());
        var diffMins = diffMs < 0 ? 0 : Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
        var scoreFactor = LevelScore[user.game.level];
        scoreFactor = Number.isInteger(scoreFactor) ? scoreFactor : 0;

        // Hint factor
        var hintFactor = 1;
        if (user.game.hints.length > 0) {
            hintFactor = 1 - ((user.game.hints.length + 1) * 0.1);
        }
        user.game.score += diffMins * scoreFactor * hintFactor;
        user.game.score = Math.round(user.game.score);

        // Clear hints for next level
        user.game.hints = [];
        user.game.hasMoreHints = true;

        // if user finished the game, we set the time:
        if (user.game.level == 6) {
            user.game.timeUserFinished = new Date();
        }

        // save:
        user.save();
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

function plusOne(){
    var http = require('http');
    var options = {
        host: 'dkom16boothcount.meteorapp.com',
        port: 80,
        path: '/plusone?name=Hackmeifyoucan2',
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
            'Content-Length': 0
        }
    };

    var httpreq = http.request(options, function (response) {
        response.setEncoding('utf8');
        response.on('data', function (chunk) {
            console.log("body: " + chunk);
        });
    });
    httpreq.end();
}