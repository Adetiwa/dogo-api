"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require("express");

var _support = require("../model/support");

var _support2 = _interopRequireDefault(_support);

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
    var newSupport = new _support2.default();
    newSupport.category = req.body.category;
    newSupport.text = req.body.text;
    newSupport.title = req.body.title;

    newSupport.save(function (err) {
      if (err) {
        res.status(403).json({ status: false, msg: err });
        return;
      }
      _support2.default.find({}, function (err, support) {
        if (err) {
          res.status(403).json({ status: false, msg: err });
          return;
        }
        res.json({ status: true, message: "Support successfully created", data: support });
      });
    });
  });

  //'v1/foodtruck'
  api.get('/', _authmiddleware.authenticate, function (req, res) {
    _support2.default.find({}, function (err, supports) {
      if (err) {
        res.status(403).json({ status: false, msg: err });
        return;
      }
      res.json({ status: true, data: supports });
    });
  });

  //'v1/foodtruck/:id' - DELETE
  api.delete('/:id', _adminAuth.adminAuthorization, function (req, res) {
    _support2.default.findById(req.params.id, function (err, support) {
      if (err) {
        res.status(500).send(err);
        return;
      }
      if (support === null) {
        res.status(404).json({ status: false, msg: "support not found" });
        return;
      }
      _support2.default.remove({
        "_id": req.params.id
      }, function (err, support) {
        if (err) {
          res.status(500).json({ status: false, msg: err });
          return;
        }
        _support2.default.find({}, function (err, support) {
          if (err) {
            res.status(403).json({ status: false, msg: err });
            return;
          }
          res.json({ status: true, message: "Support successfully deleted", data: support });
        });
      });
    });
  });

  return api;
};
//# sourceMappingURL=support.js.map