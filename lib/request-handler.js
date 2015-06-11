var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

var db = require('../app/config');
var User = require('../app/models/user');
var Link = require('../app/models/link');

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function(){
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  Link.find(function(err, links) {
    if (err){return console.log(err);}
    res.send(200, links);
  })
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  Link.find({url: uri}, function(err, found) {
    if (err){return console.log(err);}
    if (found) {
      res.send(200, found);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }

        var link = Link.createNewLink({
          url: uri,
          title: title,
          base_url: req.headers.origin
        });

        link.save(function(err, newLink) {
          if(err){return console.log(err);}
          res.send(200, newLink);
        });

      });
    }
  });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  new User({ username: username })
    .fetch()
    .then(function(user) {
      if (!user) {
        res.redirect('/login');
      } else {
        user.comparePassword(password, function(match) {
          if (match) {
            util.createSession(req, res, user);
          } else {
            res.redirect('/login');
          }
        })
      }
  });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.find({ username: username }, function(err, user) {
    if (err) {
      console.log(err);
    }
    if (!user) {
      var newUser = User.createNewUser({
        username: username,
        password: password
      });
      newUser.save(function(err, savedUser) {
        util.createSession(req, res, savedUser);
      });
    } else {
      res.redirect('/signup');
    }
  });

};

exports.navToLink = function(req, res) {
  Link.find({ code: req.params[0] }, function(err, link) {
    if (err){return console.log(err);}
    if (!link) {
      res.redirect('/');
    } else {
      link.visits += 1;
      link.save(function(err, link) {
        if (err){return console.log(err);}
        res.redirect(link.url);
      });
    }
  });
}
