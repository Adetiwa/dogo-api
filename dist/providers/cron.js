"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _history = require("../model/history");

var _history2 = _interopRequireDefault(_history);

var _failed = require("../model/failed");

var _failed2 = _interopRequireDefault(_failed);

var _request = require("request");

var _request2 = _interopRequireDefault(_request);

var _config = require("../config");

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var schedule = require('node-schedule');


var cronJob = schedule.scheduleJob('*/1 * * * *', function () {
  // console.log('Cron job runs every second!');

  _history2.default.find({ status: "completed", payment_method: 'CARD', payment_status: null }, function (err, trans) {
    if (err) {
      console.log(err);
      return;
    }

    if (trans.length > 0) {
      trans.forEach(function (element) {
        _request2.default.post({
          url: 'https://api.paystack.co/transaction/charge_authorization',
          headers: {
            "Authorization": "Bearer " + _config2.default.secret.paystack_token
          },
          json: {
            authorization_code: element.card,
            email: element.email,
            amount: element.cost * 100

          }
        }, function (error, response, body) {
          if (response.body.data.status === "success") {
            //good!!!!
            console.log('One payment made');
            element.payment_status = "completed";
            element.driver_status = "completed";
            element.ref = response.body.data.reference;

            element.save();
          }
        });
      });
    }
  });
});

exports.default = cronJob;
//# sourceMappingURL=cron.js.map