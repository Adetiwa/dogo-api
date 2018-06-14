const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
import passportLocalMongoose from "passport-local-mongoose";
import config from '../config';
const Schema = mongoose.Schema;

import expressJwt from "express-jwt";
import jwt from "jsonwebtoken";


const TOKENTIME = '365d'; //1 year
const SECRET = "rr34r3m4r34r3 4r34r3k4r34r3 ";

var driverSchema = new mongoose.Schema({
user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
},
verified: {
  type: Boolean,
  required: true,
  default: false,
},
active: {
  type: Boolean,
  default: true,
},
busy: {
  type: Boolean,
  default: false,
},
last_location: {
  type: Object 
},
driver_licence: {
  type: String
},
account_info: {
  type: Object,
},
date_verified:  { 
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
