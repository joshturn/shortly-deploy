var db = require('../config');
var crypto = require('crypto');
var mongoose = require('mongoose');


exports.Link = mongoose.model('url', db.urlSchema);

exports.createNewLink = function(params) {
  params.visits = 0;
  var shasum = crypto.createHash('sha1');
  shasum.update(params.url);
  params.code = shasum.digest('hex').slice(0, 5);
  return new exports.Link(params);
};

