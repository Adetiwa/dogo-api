"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require("express");

var _fare = require("../model/fare");

var _fare2 = _interopRequireDefault(_fare);

var _authmiddleware = require("../middleware/authmiddleware");

var _adminAuth = require("../middleware/adminAuth");

var _auth = require("../helpers/auth");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (_ref) {
  var config = _ref.config,
      db = _ref.db;

  var api = (0, _express.Router)();

  //'v1/foodtruck/add'
  api.post('/add', _adminAuth.adminAuthorization, function (req, res) {
    var type = req.body.type;
    _fare2.default.find({ type: type }, function (err, fare) {
      if (err) {
        if (err.errors.type.kind == 'enum') {
          res.status(403).json({ status: false, msg: 'Invalid fare type' });
        } else {
          res.status(403).json({ status: false, msg: err });
        }
        return;
      }
      if (fare.length == 0) {
        var newFare = new _fare2.default();
        newFare.type = req.body.type;
        newFare.first_3_hours = req.body.first_3_hours;
        newFare.per_min = req.body.per_min;
        if (req.body.type == 'round_trip') {
          newFare.one_way_charge = 0;
        } else {
          newFare.one_way_charge = req.body.one_way_charge;
        }
        newFare.night_charge = req.body.night_charge;

        newFare.save(function (err) {
          if (err) {
            res.status(403).json({ status: false, msg: err });
            return;
          }
          _fare2.default.find({}, function (err, fare) {
            if (err) {
              res.status(403).json({ status: false, msg: err });
              return;
            }
            res.json({ status: true, message: "Fare successfully created", data: fare });
          });
        });
      } else {

        _fare2.default.find({}, function (err, fare) {
          if (err) {
            res.status(403).json({ status: false, msg: err });
            return;
          }
          res.json({ status: true, message: "Fare already added", data: fare });
        });
      }
    });
  });

  //'v1/foodtruck'
  api.get('/', _authmiddleware.authenticate, function (req, res) {
    _fare2.default.find({}, function (err, fares) {
      if (err) {
        res.status(403).json({ status: false, msg: err });
        return;
      }
      res.json({ status: true, data: fares });
    });
  });

  //'v1/foodtruck/:id' - READ
  api.get('/:id', _adminAuth.adminAuthorization, function (req, res) {
    _fare2.default.findById(req.params.id, function (err, fare) {
      if (err) {
        res.status(500).json({ status: false, msg: err });
        return;
      }
      res.json({ status: false, data: fare });
    });
  });

  //'v1/foodtruck/:id' - UPDATE
  api.put('/', _adminAuth.adminAuthorization, function (req, res) {
    var type = req.body.type;
    if (type) {
      _fare2.default.findOneAndUpdate({ type: type }, req.body, { new: true }, function (err, fare) {
        if (err) {
          res.status(403).json({ status: false, msg: err });
          return;
        }
        if (fare) {

          _fare2.default.find({}, function (err, fares) {
            if (err) {
              res.status(403).json({ status: false, msg: err });
              return;
            }
            res.json({ status: true, message: "Fare successfully editted", data: fares });
          });
        } else {
          res.status(403).json({ status: false, msg: "Fare type doesn't exist" });
        }
      });
    }
  });

  //'v1/foodtruck/:id' - DELETE
  api.delete('/:id', _adminAuth.adminAuthorization, function (req, res) {
    _fare2.default.findById(req.params.id, function (err, fare) {
      if (err) {
        res.status(500).send(err);
        return;
      }
      if (fare === null) {
        res.status(404).json({ status: false, msg: "Fare not found" });
        return;
      }
      _fare2.default.remove({
        "_id": req.params.id
      }, function (err, fare) {
        if (err) {
          res.status(500).json({ status: false, msg: err });
          return;
        }
        _fare2.default.find({}, function (err, fares) {
          if (err) {
            res.status(403).json({ status: false, msg: err });
            return;
          }
          res.json({ status: true, message: "Fare successfully deleted", data: fares });
        });
      });
    });
  });

  return api;
};
//# sourceMappingURL=fare.js.map