"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require("express");

var _request = require("request");

var _request2 = _interopRequireDefault(_request);

var _card = require("../model/card");

var _card2 = _interopRequireDefault(_card);

var _authmiddleware = require("../middleware/authmiddleware");

var _config = require("../config");

var _config2 = _interopRequireDefault(_config);

var _adminAuth = require("../middleware/adminAuth");

var _auth = require("../helpers/auth");

var _helpers = require("../helpers");

var _helpers2 = _interopRequireDefault(_helpers);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ip = require("ip");

exports.default = function (_ref) {
  var config = _ref.config,
      db = _ref.db;

  var api = (0, _express.Router)();

  //'v1/foodtruck/add'
  api.post('/add', _authmiddleware.authenticate, function (req, res) {
    _request2.default.post({
      url: 'https://api.paystack.co/charge',
      headers: {
        "Authorization": "Bearer " + config.secret.paystack_token
      },
      json: {
        user: req.body.user,
        email: req.body.email,
        amount: 1,
        card: {
          number: req.body.number,
          cvv: req.body.cvv,
          expiry_month: req.body.expiry_month,
          expiry_year: req.body.expiry_year
        },
        pin: req.body.pin,
        reusable: true
      }
    }, function (error, response, body) {
      if (response.body.status) {
        if (response.body.data.status == 'send_otp') {
          res.json({ status: true,
            msg: response.body.data.display_text,
            message: "send_otp",
            data: response.body.data });
        } else if (response.body.data.status == 'send_phone') {
          res.json({ status: true,
            msg: response.body.data.display_text,
            message: "send_otp",
            data: response.body.data });
        } else if (response.body.data.status == 'success') {
          var newCard = new _card2.default();
          newCard.user = req.body.user;
          newCard.type = response.body.data.authorization.brand;
          newCard.last4 = response.body.data.authorization.last4;
          newCard.authorization_code = response.body.data.authorization.authorization_code;
          newCard.signature = response.body.data.authorization.signature;
          newCard.save(function (err) {
            if (err) {
              res.status(403).json({ status: false, msg: err });
              return;
            }
            _card2.default.find({ user: req.body.user }, function (err, cards) {
              if (err) {
                res.status(403).json({ status: false, msg: err });
                return;
              }
              res.json({ status: true, message: "success", data: cards });
            });
          });
        } else {
          res.json({ status: true,
            msg: response.body.data.status,
            message: response.body.data.status,
            data: response.body.data });
        }
      } else {
        res.status(200).json({ status: false, msg: response.body.data.message });
        return;
      }
    });
  });

  api.post('/send_otp', _authmiddleware.authenticate, function (req, res) {
    _request2.default.post({
      url: 'https://api.paystack.co/charge/submit_otp',
      headers: {
        "Authorization": "Bearer " + config.secret.paystack_token
      },
      json: {
        otp: req.body.otp,
        reference: req.body.reference,
        pin: req.body.pin,
        user: req.body.user
      }
    }, function (error, response, body) {
      if (response.body.status) {
        if (response.body.data.status == 'send_phone') {
          res.json({ status: true,
            msg: response.body.data.display_text,
            message: "send_otp",
            data: response.body.data });
        } else if (response.body.data.status == 'success') {
          var newCard = new _card2.default();
          newCard.user = req.body.user;
          newCard.pin = req.body.pin;
          newCard.type = response.body.data.authorization.brand;
          newCard.last4 = response.body.data.authorization.last4;
          newCard.authorization_code = response.body.data.authorization.authorization_code;
          newCard.signature = response.body.data.authorization.signature;
          newCard.save(function (err) {
            if (err) {
              res.status(403).json({ status: false, msg: err });
              return;
            }
            _card2.default.find({ user: req.body.user }, function (err, cards) {
              if (err) {
                res.status(403).json({ status: false, msg: err });
                return;
              }
              res.json({ status: true, message: "Card successfully created", data: cards });
            });
          });
        } else {
          res.json({ status: true,
            msg: response.body.data.status,
            message: response.body.data.status,
            data: response.body.data });
        }
      } else {
        res.status(200).json({ status: false, msg: response.body.data.message });
        return;
      }
    });
  });

  //'v1/foodtruck'
  api.get('/:id', _authmiddleware.authenticate, function (req, res) {
    _card2.default.find({ user: req.params.id }, function (err, cards) {
      if (err) {
        res.status(403).json({ status: false, msg: err });
        return;
      }
      res.json({ status: true, data: cards });
    });
  });

  api.post('/test', function (req, res) {
    var body = {
      PBFPubKey: req.body.PBFPubKey,
      cardno: req.body.cardno,
      cvv: req.body.cvv,
      expirymonth: req.body.expirymonth,
      expiryyear: req.body.expiryyear,
      amount: req.body.amount,
      email: req.body.email,
      IP: ip.address(),
      txRef: "MC-" + Date.now()
    };

    var secretKey = _helpers2.default.getKey('FLWSECK-02d3111b7b4b8c8e6ca40c320a0aab3f-X');
    var reqClient = _helpers2.default.encrypt(secretKey, JSON.stringify(body));

    _request2.default.post({
      url: 'https://api.ravepay.co/flwv3-pug/getpaidx/api/charge',
      headers: {
        "Authorization": "Bearer FLWSECK-b2ddc3858f03ce8a02a8989a33b6333f-X",
        "Content-Type": "application/json"
      },
      json: {
        client: reqClient,
        PBFPubKey: req.body.PBFPubKey
        // alg: "3DES-24"
      }
    }, function (error, response, body) {
      console.log(JSON.stringify(body));
      return;
    });
  });

  //'v1/foodtruck/:id' - DELETE
  api.delete('/:id', _authmiddleware.authenticate, function (req, res) {
    _card2.default.findById(req.params.id, function (err, card) {
      if (err) {
        res.status(500).send(err);
        return;
      }
      if (card === null) {
        res.status(404).json({ status: false, msg: "Card not found" });
        return;
      }
      _card2.default.remove({
        "_id": req.params.id
      }, function (err, card) {
        if (err) {
          res.status(500).json({ status: false, msg: err });
          return;
        }
        _card2.default.find({ user: req.params.user }, function (err, cards) {
          if (err) {
            res.status(403).json({ status: false, msg: err });
            return;
          }
          res.json({ status: true, message: "Fare successfully deleted", data: cards });
        });
      });
    });
  });

  return api;
};
//# sourceMappingURL=card.js.map