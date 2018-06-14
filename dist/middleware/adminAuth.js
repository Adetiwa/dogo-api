"use strict";

var _user = require("../model/user");

var _user2 = _interopRequireDefault(_user);

var _jsonwebtoken = require("jsonwebtoken");

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _expressJwt = require("express-jwt");

var _expressJwt2 = _interopRequireDefault(_expressJwt);

var _config = require("../config");

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var adminAuthorization = function adminAuthorization(req, res, next) {
  var auth = req.headers.authorization;
  if (auth) {
    var token = auth.split(' ');
    try {
      var decoded = _jsonwebtoken2.default.verify(token[1], _config2.default.secret.secret);
      if (decoded.type == 'admin') {
        next();
      } else {
        res.status(403).json({ status: false, msg: "You have no access to this resource" });
        return;
      }
    } catch (err) {
      res.status(403).json({ status: false, msg: err.message });
      return;
    }
  } else {
    res.status(403).json({ status: false, msg: "Authorization-Token is required" });
    return;
  }
};

var userAuthentication = function userAuthentication(req, res, next) {
  var auth = req.headers.authorization;
  if (auth) {

    var token = auth.split(' ');
    try {
      var decoded = _jsonwebtoken2.default.verify(token[1], _config2.default.secret.secret);
      next(decoded.id);
    } catch (err) {
      res.status(403).json({ status: false, msg: err.message });
      return;
    }
  } else {
    res.status(403).json({ status: false, msg: "Authorization-Token is required" });
    return;
  }
};

module.exports = {
  adminAuthorization: adminAuthorization,
  userAuthentication: userAuthentication
};
//# sourceMappingURL=adminAuth.js.map