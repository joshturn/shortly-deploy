var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

var db = require('../app/config');
var User = require('../app/models/user');
var Link = require('../app/models/link');

exports.renderIndex = function(req, res) {
  console.log('rendering index');
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
  console.log('fetching links');
  Link.find(function(err, links) {
    console.log('links');
    if (err){return console.log(err);}
    res.send(200, links);
  })
};

exports.saveLink = function(req, res) {
  console.log('inside savelink');
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  Link.findOne({url: uri}, function(err, found) {
    console.log('Inside find function');
    if (err){
      throw err;
    }
    if (found) {
      console.log('Url exists!');
      res.send(200, found);
    } else {
      console.log('Url does not exist');
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }

        var link = new Link({
          url: uri,
          title: title,
          base_url: req.headers.origin
        });

        console.log('Creating new link: ', link);

        link.save(function(err, newLink) {
          console.log('saving new link: ', newLink);
          if(err){
            res.send(500, err);
          }
          res.send(200, newLink);
        });

      });
    }
  });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({ username: username }, function(err, user) {
    if (err) {
      res.send(500, err);
    }
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
  })
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({ username: username }, function(err, user) {
    if (err) {
      console.log(err);
    }
    if (!user) {
      var newUser = new User({
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

  Link.findOne({ code: req.params[0] }, function(err, link) {
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
