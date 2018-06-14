const router = require('express').Router();
const User = require('../models/user')
router.get('/', (req, res, next) => {
  res.render('main/landing');
});

router.get('/create-new-user', (req, res, next) => {
  var user = new User();
  user.email = 'adetiwa1@gmail.com';
  user.name = 'Adetiwa Olumide';
  user.password = 'Maintain1!',
  user.save(function(err) {
    if (err) console.log(err);
    res.json('Successfully created user');
  });
});


module.exports = router;
