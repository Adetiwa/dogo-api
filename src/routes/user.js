const router = require('express').Router();
const User = require('../models/user');
const passport = require('passport');
const passportCongig = require('../config/passport');


router.route('/signup')
  .get((req, res, next) => {
    res.render('accounts/signup', {message: req.flash('errors')})
  })
  .post((req, res, next) => {
    User.findOne({email: req.body.email}, function(err, user) {
      if(user) {
        req.flash('errors', 'account with that email address already exist');
        res.redirect('/signup')
      } else {
        var user = new User();
        user.name = req.body.name;
        user.email = req.body.email;
        user.photo = user.gravatar();
        user.password = req.body.password;
        user.save(function(err) {
          req.logIn(user, function(err) {
            if(err) return next(err);
            res.redirect('/');
          });
        });

      }
    });
  });




  router.get('/olumide', (req, res) => {
      res.json('Hello world');
  });






  router.route('/login')
    .get((req, res, next) => {
      if (req.user) res.redirect('/');
      res.render('accounts/login', {message: req.flash('loginMessage')})
    })
    .post(passport.authenticate('local-login', {
      successRedirect: '/',
      failureRedirect: '/login',
      failureFlash: true,
    }));


router.get('logout', (req, res, next) => {
  req.logout();
  res.redirect('/');
});



  module.exports = router;
