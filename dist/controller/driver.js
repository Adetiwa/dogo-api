"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require("express");

var _user = require("../model/user");

var _user2 = _interopRequireDefault(_user);

var _driver = require("../model/driver");

var _driver2 = _interopRequireDefault(_driver);

var _history = require("../model/history");

var _history2 = _interopRequireDefault(_history);

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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

exports.default = function (_ref) {
  var config = _ref.config,
      db = _ref.db;

  var api = (0, _express.Router)();
  // 'v1/user'


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
          user: user,
          //   fullname: user.name,
          //   email: user.username,
          //   tel: user.tel,
          //   type: user.type,
          token: _token,
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

  api.get('/getdriver/:id', _authmiddleware.authenticate, function (req, res) {
    _user2.default.find({ driver_info: { $ne: null }, _id: { $ne: req.params.id }, "driver_info.busy": false, "driver_info.active": true, "driver_info.verified": true }).limit(20).exec(function (err, drivers) {
      if (err) {
        res.status(500).json({ status: false, msg: "A server error occured" });
        return;
      }
      if (drivers.length == 0) {
        res.status(500).json({ status: true, data: [], msg: "No driver is available" });
        return;
      } else {
        res.status(500).json({ status: true, data: drivers });
        return;
      }
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

  api.put('/update', _authmiddleware.authenticate, function (req, res) {
    _user2.default.findById(req.body.id, function (err, user) {
      if (err) {
        if (err.name == "CastError") {
          res.status(403).json({ status: false, msg: 'Invalid data!' });
        } else {
          res.status(403).json({ status: false, msg: err });
        }
        return;
      }

      if (!user) {
        res.status(500).json({ status: false, msg: "User doesn't exist" });
        return;
      }

      _user2.default.findOne({ _id: req.body.id }).exec(function () {
        var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(err, user) {
          var resUser;
          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  if (!err) {
                    _context.next = 3;
                    break;
                  }

                  res.status(403).json({ status: false, msg: err });
                  return _context.abrupt("return");

                case 3:
                  if (user) {
                    _context.next = 6;
                    break;
                  }

                  res.status(403).json({ status: false, msg: 'User not found' });
                  return _context.abrupt("return");

                case 6:
                  if (!user.driver_info.busy) {
                    _context.next = 9;
                    break;
                  }

                  res.status(403).json({ status: false, msg: 'You cannot go offline, you have an active trip!' });
                  return _context.abrupt("return");

                case 9:
                  _user2.default.update({ _id: req.body.id }, {
                    $set: {
                      "driver_info.active": req.body.state
                    }
                  }, function (err, value) {
                    // console.log(value)
                  });

                  _context.prev = 10;
                  _context.next = 13;
                  return _user2.default.findById(req.body.id);

                case 13:
                  resUser = _context.sent;

                  res.status(200).json({ status: true, msg: "Success", data: resUser });
                  _context.next = 20;
                  break;

                case 17:
                  _context.prev = 17;
                  _context.t0 = _context["catch"](10);

                  res.status(500).json({ status: false, msg: "A server error occured" });

                case 20:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee, undefined, [[10, 17]]);
        }));

        return function (_x, _x2) {
          return _ref2.apply(this, arguments);
        };
      }()
      // User.findById(req.body.id, (err, user) => {
      //   if (err) {
      //     res.status(500).json({status: false, msg: "A server error occured"});
      //     return;
      //   } 

      //   res.status(200).json({status: true, msg: "Success", data: user});

      // });
      );
    });
  });

  return api;
};
//# sourceMappingURL=driver.js.map