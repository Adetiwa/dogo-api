"use strict";

var _secret = require("../config/secret");

var _secret2 = _interopRequireDefault(_secret);

var _expressJwt = require("express-jwt");

var _expressJwt2 = _interopRequireDefault(_expressJwt);

var _jsonwebtoken = require("jsonwebtoken");

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getID = function getID(authentication) {
  var auth = authentication;
  var token = auth.split(' ');
  try {
    var decoded = _jsonwebtoken2.default.verify(token[1], process.env.SECRET);
    //console.log(JSON.stringify(decoded))
    console.log("expires: in " + new Date(decoded.exp * 1000));
    //console.log(expiryTime(decoded.exp, decoded.iat))
    return decoded.id;
  } catch (err) {
    res.status(403).json({ status: false, msg: err.message });
    return;
  }
};

var expiryTime = function expiryTime(time, iat) {
  var timestamp = iat || Math.floor(Date.now() / 1000);

  if (typeof time === 'string') {
    var milliseconds = ms(time);
    if (typeof milliseconds === 'undefined') {
      return;
    }
    return Math.floor(timestamp + milliseconds / 1000);
  } else if (typeof time === 'number') {
    return timestamp + time;
  } else {
    return;
  }
};

module.exports = {
  getID: getID,
  expiryTime: expiryTime
};
//# sourceMappingURL=auth.js.map