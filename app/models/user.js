// load the things we need
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    local: {
        email: String,
        password: String
    },
    game: {
        level: {type: Number, default: 1},
        score: {type: Number, default: 0},
        hints: [String],
        hasMoreHints: Boolean,
        timeStart: {type: Date},
        timeEnd: {type: Date},
        timeUserFinished: {type: Date}
    }
});

// generating a hash
userSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
