"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

var _express = require("express");

var _activity = require("../model/activity");

var _activity2 = _interopRequireDefault(_activity);

var _user = require("../model/user");

var _user2 = _interopRequireDefault(_user);

var _authmiddleware = require("../middleware/authmiddleware");

var _adminAuth = require("../middleware/adminAuth");

var _auth = require("../helpers/auth");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (_ref) {
  var config = _ref.config,
      db = _ref.db;

  var api = (0, _express.Router)();

  api.get('/', _adminAuth.adminAuthorization, function (req, res) {
    _activity2.default.find({}, function (err, activities) {
      if (err) {
        res.status(403).json({ status: false, msg: err });
        return;
      }
      res.json(activities);
    });
  });

  return api;
};
// import Door from "../model/door";
//# sourceMappingURL=activity.js.map