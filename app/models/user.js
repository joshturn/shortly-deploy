var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');
var mongoose = require('mongoose');

mongoose.model('user', db.userSchema);

exports.createNewUser = function(params){
  db.userSchema.pre('save', function(next){
    var newUser = this;

    hashPassword(newUser).then(next);

  });
  return new user(params);
};

exports.comparePassword = function(user, attemptedPassword, callback){
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
