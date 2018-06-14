'use strict';

var router = require('express').Router();
var User = require('../models/user');
var passport = require('passport');
var passportCongig = require('../config/passport');

router.route('/signup').get(function (req, res, next) {
  res.render('accounts/signup', { message: req.flash('errors') });
}).post(function (req, res, next) {
  User.findOne({ email: req.body.email }, function (err, user) {
    if (user) {
      req.flash('errors', 'account with that email address already exist');
      res.redirect('/signup');
    } else {
      var user = new User();
      user.name = req.body.name;
      user.email = req.body.email;
      user.photo = user.gravatar();
      user.password = req.body.password;
      user.save(function (err) {
        req.logIn(user, function (err) {
          if (err) return next(err);
          res.redirect('/');
        });
      });
    }
  });
});

router.get('/olumide', function (req, res) {
  res.json('Hello world');
});

router.route('/login').get(function (req, res, next) {
  if (req.user) res.redirect('/');
  res.render('accounts/login', { message: req.flash('loginMessage') });
}).post(passport.authenticate('local-login', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}));

router.get('logout', function (req, res, next) {
  req.logout();
  res.redirect('/');
});

module.exports = router;
//# sourceMappingURL=user.js.map