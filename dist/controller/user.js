"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

var _express = require("express");

var _user = require("../model/user");

var _user2 = _interopRequireDefault(_user);

var _driver = require("../model/driver");

var _driver2 = _interopRequireDefault(_driver);

var _bodyParser = require("body-parser");

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _passport = require("passport");

var _passport2 = _interopRequireDefault(_passport);

var _config = require("../config");

var _config2 = _interopRequireDefault(_config);

var _bcryptjs = require("bcryptjs");

var _bcryptjs2 = _interopRequireDefault(_bcryptjs);

var _request = require("request");

var _request2 = _interopRequireDefault(_request);

var _token2 = require("../model/token");

var _token3 = _interopRequireDefault(_token2);

var _authmiddleware = require("../middleware/authmiddleware");

var _adminAuth = require("../middleware/adminAuth");

var _auth = require("../helpers/auth");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (_ref) {
  var config = _ref.config,
      db = _ref.db;

  var api = (0, _express.Router)();
  // 'v1/user'

  api.post('/register', function (req, res) {
    var type = req.body.type;
    var tel = req.body.tel;
    var email = req.body.email;

    _user2.default.findOne({ username: email, tel: tel }, function (err, user) {
      if (err) {
        res.status(500).send({ status: false, msg: err });
        return;
      }

      if (user !== null) {
        var thisUserType = user.type;
        if (thisUserType.includes(type)) {
          //throw error
          res.status(200).send({ status: false, msg: "This account is already a " + type + " account" });
          return;
        } else {
          if (type == 'driver') {
            user.driver_info = req.body.driver_info;
            _user2.default.update({ _id: user._id }, {
              $addToSet: {
                "type": "driver"
              }
            }, function (err, data) {
              console.log(data);
            });

            user.save(function (err, user) {
              if (err) {
                res.status(500).send({ status: false, msg: err });
                return;
              }
              // res.status(500).send({status: true, msg: 'Driver saved'});
              _request2.default.post({
                url: config.secret.url + 'v1/user/login',
                json: { email: req.body.email, password: req.body.password }
              }, function (error, response, body) {
                if (error) {
                  res.status(500).send({ status: false, msg: error });
                  return;
                } else {
                  res.status(200).send(response.body);
                }
              });

              return;
            });
            return;
            // user.type = user.type.push('driver');
            // user.driver_info = req.body.user_info;
            // user.save((err, user) => {
            //   if (err) {
            //     res.status(500).send({status: false, msg: err});
            //     return;
            //   }
            //   res.status(500).send({status: false, msg: 'Driver saved'});
            // });
          }
          //login!!!

          //   request.post({
          //     url: config.secret.url+'v1/user/login',
          //     json: { email: user.email, password: user.password }
          //   }, function(error, response, body){
          //     if (error) {
          //       res.status(500).send({status: false, msg: error});
          //       return;
          //     } else {
          //       res.status(200).send(response.body);
          //     }
          // });
          return;
        }
      } else if (req.body.type == 'user') {
        _user2.default.register(new _user2.default({ username: req.body.email, name: req.body.name, tel: req.body.tel, type: req.body.type }), req.body.password, function (err, user) {
          if (err) {
            if (err.code == 11000) {
              res.status(500).send({ status: false, msg: 'This number has been used by an existing user' });
            } else {
              res.status(500).send({ status: false, msg: err.message });
            }
            return;
          }
          _passport2.default.authenticate('local', {
            session: false
          })(req, res, function () {

            _request2.default.post({
              url: config.secret.url + 'v1/user/login',
              json: { email: req.body.email, password: req.body.password }
            }, function (error, response, body) {
              if (error) {
                res.status(500).send({ status: false, msg: error });
                return;
              } else {
                res.status(200).send(response.body);
              }
            });
          });
        });
      } else if (req.body.type == 'driver') {
        _user2.default.register(new _user2.default({ username: req.body.email, name: req.body.name, tel: req.body.tel, type: req.body.type, driver_info: req.body.driver_info }), req.body.password, function (err, user) {
          if (err) {
            if (err.code == 11000) {
              res.status(500).send({ status: false, msg: 'This number has been used by an existing user' });
            } else {
              res.status(500).send({ status: false, msg: err.message });
            }
            return;
          }
          _passport2.default.authenticate('local', {
            session: false
          })(req, res, function () {

            _request2.default.post({
              url: config.secret.url + 'v1/user/login',
              json: { email: req.body.email, password: req.body.password }
            }, function (error, response, body) {
              if (error) {
                res.status(500).send({ status: false, msg: error });
                return;
              } else {
                res.status(200).send(response.body);
              }
            });
          });
        });
      }
    });
  });

  // 'v1/account/login'

  api.post('/login', function (req, res) {
    _passport2.default.authenticate('local', function (err, user, info) {
      var token;

      // If Passport throws/catches an error
      if (err) {
        res.status(404).json({ status: false, msg: err });
        return;
      }

      // If a user is found
      if (user) {
        var _token = user.generateJwt();
        res.status(200).json({
          // user: user,
          id: user._id,
          fullname: user.name,
          email: user.username,
          tel: user.tel,
          type: user.type,
          token: _token,
          driver_info: user.driver_info,
          iat: user.iat,
          exp: user.exp,
          status: true
        });
      } else {
        // If user is not found
        res.status(401).json({ status: false, msg: 'Email or password is incorrect' });
      }
    })(req, res);
  });

  api.get('/logout/:id', _authmiddleware.authenticate, function (req, res) {
    _token3.default.find({ user: req.params.id }).remove(function (err, token) {
      if (err) {
        res.status(500).json({ status: false, msg: "A server error occured" });
      } else {
        // we have deleted the user
        req.logout();
        res.status(200).send({ status: true, msg: 'success' });
      }
    });
  });

  api.put('/change_password', _authmiddleware.authenticate, function (req, res) {
    _user2.default.findById(req.body.user, function (err, user) {
      if (err) {
        res.status(500).json({ status: false, msg: "A server error occured" });
        return;
      }
      if (!user) {
        res.status(500).json({ status: false, msg: "User doesn't exist" });
        return;
      }
      user.setPassword(req.body.password, function (err, user) {
        if (err) {
          res.status(500).json({ status: false, msg: "A server error occured" });
          return;
        }
        user.save(function (err) {
          if (err) {
            res.status(500).json({ status: false, msg: "A server error occured" });
            return;
          }

          res.status(200).json({ status: false, msg: "Password successfully changed", data: user });
          return;
        });
      });
    });
  });

  api.get('/:id', _authmiddleware.authenticate, function (req, res) {
    _user2.default.findById(req.params.id, function (err, user) {
      if (err) {
        if (err.name == "CastError") {
          res.status(403).json({ status: false, msg: 'Invalid data!' });
        } else {
          res.status(403).json({ status: false, msg: err });
        }
        return;
      }
      res.json({ status: true, data: user });
    });
  });

  return api;
};
//# sourceMappingURL=user.js.map