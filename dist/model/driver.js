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

var driverSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  verified: {
    type: Boolean,
    required: true,
    default: false
  },
  active: {
    type: Boolean,
    default: true
  },
  busy: {
    type: Boolean,
    default: false
  },
  last_location: {
    type: Object
  },
  driver_licence: {
    type: String
  },
  account_info: {
    type: Object
  },
  date_verified: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Driver', driverSchema);

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
//# sourceMappingURL=driver.js.map