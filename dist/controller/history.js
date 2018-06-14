"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require("express");

var _history = require("../model/history");

var _history2 = _interopRequireDefault(_history);

var _user = require("../model/user");

var _user2 = _interopRequireDefault(_user);

var _fare = require("../model/fare");

var _fare2 = _interopRequireDefault(_fare);

var _token = require("../model/token");

var _token2 = _interopRequireDefault(_token);

var _authmiddleware = require("../middleware/authmiddleware");

var _adminAuth = require("../middleware/adminAuth");

var _auth = require("../helpers/auth");

var _notification = require("../services/notification");

var _notification2 = _interopRequireDefault(_notification);

var _notification3 = require("../model/notification");

var _notification4 = _interopRequireDefault(_notification3);

var _fare3 = require("./../services/fare");

var _fare4 = _interopRequireDefault(_fare3);

var _email = require("../services/email");

var _email2 = _interopRequireDefault(_email);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

exports.default = function (_ref) {
  var config = _ref.config,
      db = _ref.db;

  var api = (0, _express.Router)();

  api.post('/', _authmiddleware.authenticate, function (req, res) {
    _history2.default.find({ $and: [{ user: req.body.user }, { status: { $ne: "cancelled" } }, { status: { $ne: "completed" } }] }, function (err, userFind) {
      if (err) {
        res.status(500).json({ status: false, code: 100, msg: err });
        return;
      }

      if (userFind.length > 0) {
        res.status(500).json({ status: false, code: 101, msg: "You have an active trip going to. Reload your app, and have a good connection" });
        return;
      }

      _history2.default.find({ $and: [{ driver: req.body.driver }, { status: { $ne: "cancelled" } }, { status: { $ne: "completed" } }] }, function (err, driverFind) {
        if (err) {
          res.status(500).json({ status: false, code: 100, msg: err });
          return;
        }

        if (driverFind.length > 0) {
          res.status(500).json({ status: false, code: 101, msg: "Oops! This driver just got busy. Try with another active driver" });
          return;
        }

        _user2.default.findById(req.body.user, function (err, driver) {
          if (err) {
            res.status(500).json({ status: false, code: 100, msg: err });
            return;
          }

          if (driver == null) {
            res.status(500).json({ status: false, code: 101, msg: "Wow This driver doesn't exist" });
            return;
          }

          if (driver.driver_info.busy) {
            res.status(500).json({ status: false, code: 102, msg: "Wow This driver just became busy with another trip" });
            return;
          }

          var history = new _history2.default();
          history.type = req.body.type;
          history.pickup = req.body.pickup;
          history.dropoff = req.body.dropoff;
          history.cost = req.body.cost;
          history.hr = req.body.hr;
          history.km = req.body.km;
          history.date = new Date().toISOString();
          // history.driver_status = req.body.driver_status;
          history.payment_method = req.body.payment_method;
          // history.payment_status = req.body.payment_status;
          // history.status = req.body.status;
          history.email = req.body.email;
          history.user = req.body.user;
          history.pickup_coords = req.body.pickup_coords;
          history.dropoff_coords = req.body.dropoff_coords;

          history.driver = req.body.driver;
          history.card = req.body.card;
          // history.transaction_id = req.body.transaction_id;
          history.save(function (err) {
            if (err) {
              res.json({ status: false, msg: err });
              return;
            }
            ///NOTIFY_DRIVER/// 
            _token2.default.find({ user: req.body.driver }, function (err, token) {
              if (err) {
                res.status(500).json({ status: false, msg: "A server error occured" });
              } else {
                if (token.length > 0) {
                  token.forEach(function (element) {
                    (0, _notification2.default)(element.token, "Trip Assignment", "A trip has ben assigned to you", element.type);
                  });
                }
              }
            });

            _history2.default.find({ user: req.body.user }, function (err, histories) {
              if (err) {
                res.status(403).json({ status: false, msg: err });
                return;
              }
              res.json({ status: true, data: histories, driver: driver });
            });
          });
        });
      });
    });
  });

  api.get('/all', _authmiddleware.authenticate, function (req, res) {
    _history2.default.find({}, function (err, histories) {
      if (err) {
        res.status(403).json({ status: false, msg: err });
        return;
      }
      (0, _email2.default)();
      res.json({ status: true, data: histories });
    });
  });

  api.post('/cancel', _authmiddleware.authenticate, function (req, res) {
    _history2.default.findById(req.body.id, function (err, history) {
      if (err) {
        if (err.name == "CastError") {
          res.status(403).json({ status: false, msg: 'Invalid data!' });
        } else {
          res.status(403).json({ status: false, msg: err });
        }
        return;
      }
      if (history == null) {
        res.status(403).json({ status: false, msg: "This order doesn't exist" });
        return;
      }
      if (history.driver_status != null) {
        res.status(403).json({ status: false, msg: "This order cannot be cancelled as the driver already started" });
        return;
      } else {
        history.status = "cancelled";
        history.driver_status = "cancelled";
        history.save(function (err) {
          if (err) {
            res.json({ status: false, msg: err });
            return;
          }

          ///NOTIFY_DRIVER/// 


          _history2.default.find({ user: req.body.user }, function (err, histories) {
            if (err) {
              res.status(403).json({ status: false, msg: err });
              return;
            }
            res.json({ status: true, data: histories, driver: null });
          });
        });
      }
    });
  });

  api.get('/:id', _authmiddleware.authenticate, function (req, res) {
    _history2.default.find({ user: req.params.id }, function (err, histories) {
      if (err) {
        if (err.name == "CastError") {
          res.status(403).json({ status: false, msg: 'Invalid data!' });
        } else {
          res.status(403).json({ status: false, msg: err });
        }
        return;
      }
      res.json({ status: true, data: histories, driver: null });
    });
  });

  api.get('/driver/:id', _authmiddleware.authenticate, function (req, res) {
    _history2.default.find({ driver: req.params.id }, function (err, histories) {
      if (err) {
        if (err.name == "CastError") {
          res.status(403).json({ status: false, msg: 'Invalid data!' });
        } else {
          res.status(403).json({ status: false, msg: err });
        }
        return;
      }
      res.json({ status: true, data: histories, driver: null });
    });
  });

  api.put('/:id', _authmiddleware.authenticate, function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(req, res) {
      var history;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              _context.next = 3;
              return _fare4.default.trip.processFareRequest(req.params.id, req.body.status, req.body.driver_status, config.secret.paystack_token);

            case 3:
              history = _context.sent;
              return _context.abrupt("return", res.json({ data: history }));

            case 7:
              _context.prev = 7;
              _context.t0 = _context["catch"](0);

              res.status(500).json({ status: false, message: _context.t0 });

            case 10:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, undefined, [[0, 7]]);
    }));

    return function (_x, _x2) {
      return _ref2.apply(this, arguments);
    };
  }());

  api.delete('/:id', _adminAuth.adminAuthorization, function (req, res) {

    _history2.default.findById(req.params.id).remove(function (err, history) {
      if (err) {
        res.status(500).json({ status: false, msg: err.messsage });
      } else {
        _history2.default.find({}, function (err, histories) {
          if (err) {
            res.status(403).json({ status: false, msg: err });
            return;
          }
          res.json({ status: true, message: "History successfully created", data: histories });
        });
      }
    });
  });

  return api;
};
//# sourceMappingURL=history.js.map