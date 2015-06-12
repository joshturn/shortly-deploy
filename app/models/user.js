var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');
var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
  username: String,
  password: String
});

var User = mongoose.model('User', userSchema);

userSchema.pre('save', function(next){
  var user = this;

  hashPassword(user).then(next);
});

User.prototype.comparePassword = function(attemptedPassword, callback){
  var user = this;
  bcrypt.compare(attemptedPassword, user.password, function(err, isMatch) {
      callback(isMatch);
    });
};

var hashPassword = function(user){
  var cipher = Promise.promisify(bcrypt.hash);
  return cipher(user.password, null, null)
    .then(function(hash) {
      user.password = hash;
    });
}

module.exports = User;
