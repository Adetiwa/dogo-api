"use strict";

var _jsonwebtoken = require("jsonwebtoken");

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _expressJwt = require("express-jwt");

var _expressJwt2 = _interopRequireDefault(_expressJwt);

var _config = require("../config");

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TOKENTIME = 60 * 60 * 24 * 30; //30 day
// const SECRET = process.env.SECRET;
// console.log(SECRET, '1');

var authenticate = (0, _expressJwt2.default)({
  secret: _config2.default.secret.secret //process.env.SECRET
});

var generateAccessToken = function generateAccessToken(err, req, res, next) {
  req.token = req.token || {};
  req.token = _jsonwebtoken2.default.sign({
    id: req.user.id,
    type: req.user.type
  }, _config2.default.secret.secret, {
    expiresIn: TOKENTIME
  });
  // return req
  next();
};

var respond = function respond(req, res, err) {
  if (err) {
    res.send('error is ' + err);
    return;
  }
  res.status(200).json({
    id: req.user.id,
    fullname: req.user.name,
    user: req.user.username,
    tel: req.user.tel,
    token: req.token,
    iat: req.user.iat,
    exp: req.user.exp,
    status: 'success'
  });
};

module.exports = {
  authenticate: authenticate,
  generateAccessToken: generateAccessToken,
  respond: respond

};
//# sourceMappingURL=authmiddleware.js.map