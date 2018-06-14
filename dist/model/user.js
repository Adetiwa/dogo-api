'use strict';

var _passportLocalMongoose = require('passport-local-mongoose');

var _passportLocalMongoose2 = _interopRequireDefault(_passportLocalMongoose);

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

var _expressJwt = require('express-jwt');

var _expressJwt2 = _interopRequireDefault(_expressJwt);

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');


var Schema = mongoose.Schema;

var TOKENTIME = '365d'; //1 year
var SECRET = "rr34r3m4r34r3 4r34r3k4r34r3 ";

var userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String
  },
  tel: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String
  },
  type: {
    type: Array,
    default: 'user'
  },
  driver_info: {
    type: Object,
    default: null
  },
  date: {
    type: Date,
    default: Date.now
  }
});

userSchema.plugin(_passportLocalMongoose2.default);
userSchema.methods.generateJwt = function () {
  // var expiry = new Date();
  // expiry.setDate(expiry.getDate() + 7);

  var authenticate = (0, _expressJwt2.default)({ secret: _config2.default.secret.secret });

  var token = _jsonwebtoken2.default.sign({
    id: this.id,
    type: this.type
  }, _config2.default.secret.secret, {
    expiresIn: TOKENTIME
  });
  return token;
};

userSchema.methods.getID = function () {
  var auth = req.headers.authorization;
  var token = auth.split(' ');
  try {
    var decoded = _jsonwebtoken2.default.verify(token[1], _config2.default.secret.secret);
    return decoded.id;
  } catch (err) {
    res.status(403).json({ status: false, msg: err.message });
    return;
  }
};

//hashing a password before saving it to the database
// userSchema.pre('save', function (next) {
//   var user = this;
//   bcrypt.hash(user.password, 10, function (err, hash){
//     if (err) {
//       return next(err);
//     }
//     user.password = hash;
//     next();
//   })
// });


module.exports = mongoose.model('User', userSchema);

//
// userSchema.methods.gravatar = function(size) {
//   if(!size) size = 200;
//   if(!this.email) return 'https://gravatar.com/avartar/?s'+size+'&d=retro';
//   var md5 = crypto.createHash('md5').update(this.email).digest('hex');
//   return 'https://gravatar.com/avartar/?s'+md5+'&d=retro';
// }
//
//
// userSchema.methods.comparePassword = function(password) {
//   return bcrypt.compareSync(password, this.password);
// }
//
//
// module.exports = mongoose.model('User', userSchema);
//# sourceMappingURL=user.js.map