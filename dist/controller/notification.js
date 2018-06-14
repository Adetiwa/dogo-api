"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require("express");

var _notification = require("../model/notification");

var _notification2 = _interopRequireDefault(_notification);

var _authmiddleware = require("../middleware/authmiddleware");

var _adminAuth = require("../middleware/adminAuth");

var _auth = require("../helpers/auth");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (_ref) {
  var config = _ref.config,
      db = _ref.db;

  var api = (0, _express.Router)();

  //'v1/foodtruck/add'
  api.post('/add', _authmiddleware.authenticate, function (req, res) {
    var newNotification = new _notification2.default();
    newNotification.user = req.body.user;
    newNotification.text = req.body.text;
    newNotification.profile = req.body.profile;

    newNotification.save(function (err) {
      if (err) {
        res.status(403).json({ status: false, msg: err });
        return;
      }
      _notification2.default.find({}, function (err, noti) {
        if (err) {
          res.status(403).json({ status: false, msg: err });
          return;
        }
        res.json({ status: true, message: "Notification successfully created", data: noti });
      });
    });
  });

  //'v1/foodtruck'
  api.get('/:id', _authmiddleware.authenticate, function (req, res) {
    _notification2.default.find({ user: req.params.id }, function (err, noti) {
      if (err) {
        res.status(403).json({ status: false, msg: err });
        return;
      }
      res.json({ status: true, data: noti });
    });
  });

  //'v1/foodtruck/:id' - DELETE
  api.delete('/:id', _adminAuth.adminAuthorization, function (req, res) {
    _notification2.default.findById(req.params.id, function (err, noti) {
      if (err) {
        res.status(500).send(err);
        return;
      }
      if (noti === null) {
        res.status(404).json({ status: false, msg: "Notification not found" });
        return;
      }
      _notification2.default.remove({
        "_id": req.params.id
      }, function (err, noti) {
        if (err) {
          res.status(500).json({ status: false, msg: err });
          return;
        }
        _notification2.default.find({}, function (err, noti) {
          if (err) {
            res.status(403).json({ status: false, msg: err });
            return;
          }
          res.json({ status: true, message: "Notification successfully deleted", data: noti });
        });
      });
    });
  });

  return api;
};
//# sourceMappingURL=notification.js.map