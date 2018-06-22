import env from "dotenv";
env.config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
import passportLocalMongoose from "passport-local-mongoose";
import config from '../config';
import expressJwt from "express-jwt";
import jwt from "jsonwebtoken";

const Schema = mongoose.Schema;

const TOKENTIME = '730d'; //2 years
const SECRET = "rr34r3m4r34r3 4r34r3k4r34r3 ";

var userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  first: {
    type: String,
  },
  last: {
    type: String,
  },
  email: {
    type: String
  },
  tel: {
    type: String,
    unique : true,
    required: true,
  },
  password: {
    type: String
  },
  verified: {
    type: Boolean,
    default: false
  },
  type: {
    type: Array,
    default: 'user'
  },
  driver_info: {
    type: Object,
    default: null
  },
  date:  { 
    type: Date, 
    default: Date.now
  }
});

userSchema.plugin(passportLocalMongoose);
userSchema.methods.generateJwt = function() {
  // var expiry = new Date();
  // expiry.setDate(expiry.getDate() + 7);

  let authenticate = expressJwt({ secret: process.env.SECRET });

  let token = jwt.sign({
    id: this.id,
    type: this.type
  },
  process.env.SECRET, {
      expiresIn: TOKENTIME
  });
  return token
};


userSchema.methods.getID = function() {
  var auth = req.headers.authorization;
  var token = auth.split(' ');
  try {
      var decoded = jwt.verify(token[1], process.env.SECRET);
      return decoded.id;
  } catch(err) {
    res.status(403).json({status: false, msg: err.message})
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
