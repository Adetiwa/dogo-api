"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

var _express = require("express");

var _bodyParser = require("body-parser");

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _token = require("../model/token");

var _token2 = _interopRequireDefault(_token);

var _user = require("../model/user");

var _user2 = _interopRequireDefault(_user);

var _authmiddleware = require("../middleware/authmiddleware");

var _adminAuth = require("../middleware/adminAuth");

var _notification = require("./../services/notification");

var _notification2 = _interopRequireDefault(_notification);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (_ref) {
  var config = _ref.config,
      db = _ref.db;

  var api = (0, _express.Router)();

  //'v1/foodtruck/add'
  api.post('/add', _authmiddleware.authenticate, function (req, res) {
    var fcmToken = new _token2.default();
    _token2.default.find({ token: req.body.token }, function (err, token) {
      if (err) {
        res.json({ status: false, msg: 'here' });
        return;
      } else if (token == null || token == '') {
        fcmToken.token = req.body.token;
        fcmToken.device = req.body.device;
        fcmToken.user = req.body.user;
        fcmToken.type = req.body.type;
        fcmToken.save(function (err) {
          if (err) {
            res.json({ status: false, msg: err });
            return;
          }
          res.json({ status: true, msg: "success" });
        });
      } else {
        res.json({ status: true, msg: "token already saved" });
      }
    });
  });

  api.post('/push-test/:id', function (req, res) {
    _token2.default.find({ user: req.params.id }, function (err, token) {
      if (err) {
        console.log(err);
        res.status(500).json({ status: false, msg: "A server error occured" });
      } else {
        // we have deleted the user
        // let data = {
        //   title: "Test notification",
        //   body: "This is a test notification sent to you"
        // };
        // let not = {
        //   title: "Test notification",
        //   body: "This is a test notification sent to you"
        // };
        console.log(token.length);

        if (token.length > 0) {
          token.forEach(function (element) {
            (0, _notification2.default)(element.token, "Hello world", "To olumidde!!!!", element.type);
          });
        } else {
          // console.log("No token");
        }
        res.json({ status: true, data: token.token });
      }
    });
  });

  //'v1/foodtruck/:id' - DELETE
  api.delete('/:id', function (req, res) {

    _token2.default.findById(req.params.id).remove(function (err, token) {
      if (err) {
        res.status(500).json({ status: false, msg: "A server error occured" });
      } else {
        // we have deleted the user
        // FcmToken.remove({
        //   "_id": req.params.id
        // },(err, token) => {
        //   if (err) {
        //     res.status(500).json({status: false, msg: err});
        //     return;
        //   }

        res.status(200).json({ status: true, message: "success" });
        // });
      }
    });
  });

  return api;
};
//# sourceMappingURL=token.js.map