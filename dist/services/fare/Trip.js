'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _model = require('./../../model');

var _model2 = _interopRequireDefault(_model);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _notification = require('./../notification');

var _notification2 = _interopRequireDefault(_notification);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Trip = function () {
    function Trip() {
        _classCallCheck(this, Trip);

        this.tripMinute = 0;
        this.trip = null;
        this.createdTime = null;
        this.cost = 0;
        this.historyId = null;
    }

    /**
     * 
     */


    _createClass(Trip, [{
        key: 'getFareCost',
        value: function getFareCost(history) {
            this.historyId = history._id;

            var n = new Date().getHours();
            var night = 0;
            var hours = 0;
            var minutes = this.getMinute(history.date);
            var one_way = 0;

            if (n > 18 || n < 6) {
                night = 1;
            }

            if (minutes >= 180) {
                hours = 1;
            }

            if (history.type == 'one_way') {
                one_way = 1;
            } else {
                one_way = 0;
            }
            var cost = this.processCost(one_way, night, hours, minutes);
            this.cost = cost;

            return cost;
        }
    }, {
        key: 'processCost',
        value: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(one_way, night, hours, minutes) {
                var history, fare, cost;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                history = this.trip;
                                _context.prev = 1;
                                _context.next = 4;
                                return _model2.default.fare.findOne({ type: history.type });

                            case 4:
                                fare = _context.sent;
                                cost = 0;

                                if (!(fare != null)) {
                                    _context.next = 10;
                                    break;
                                }

                                if (hours != 1) {
                                    cost = Math.ceil(parseFloat(hours * fare.first_3_hours));
                                } else {
                                    cost = Math.ceil(parseFloat(hours * fare.first_3_hours) + parseFloat(fare.per_min * (minutes - 180)) + parseFloat(one_way * fare.one_way_charge) + parseFloat(night * fare.night_charge));
                                }
                                this.cost = cost;

                                return _context.abrupt('return', cost);

                            case 10:
                                return _context.abrupt('return', cost);

                            case 13:
                                _context.prev = 13;
                                _context.t0 = _context['catch'](1);

                                if (!_context.t0) {
                                    _context.next = 17;
                                    break;
                                }

                                throw _context.t0;

                            case 17:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this, [[1, 13]]);
            }));

            function processCost(_x, _x2, _x3, _x4) {
                return _ref.apply(this, arguments);
            }

            return processCost;
        }()

        /**
         * get the history minute
         * @param {*} createdTime 
         */

    }, {
        key: 'getMinute',
        value: function getMinute(createdTime) {
            var currentTime = new Date();
            var newdate = new Date(createdTime);
            var minutes = (currentTime - newdate) / 60000;

            this.minutes = minutes;

            return minutes;
        }
    }, {
        key: 'getDriverHistories',
        value: function () {
            var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(driverId) {
                var driverHistries;
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                _context2.next = 2;
                                return _model2.default.history.find({ driver: driverId });

                            case 2:
                                driverHistries = _context2.sent;
                                return _context2.abrupt('return', driverHistries);

                            case 4:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function getDriverHistories(_x5) {
                return _ref2.apply(this, arguments);
            }

            return getDriverHistories;
        }()
    }, {
        key: 'processFareRequest',
        value: function () {
            var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(id, status, driver_status, token) {
                var history, cost;
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                _context3.next = 2;
                                return this.getTripById(id);

                            case 2:
                                history = _context3.sent;
                                _context3.next = 5;
                                return this.getFareCost(history);

                            case 5:
                                cost = _context3.sent;

                                console.log("Cost is", cost);

                                if (!(driver_status == 'completed' && history.payment_method == 'CARD')) {
                                    _context3.next = 12;
                                    break;
                                }

                                _context3.next = 10;
                                return _request2.default.post({
                                    url: 'https://api.paystack.co/transaction/charge_authorization',
                                    headers: {
                                        "Authorization": "Bearer " + token
                                    },
                                    json: {
                                        authorization_code: history.card,
                                        email: history.email,
                                        amount: this.cost * 100
                                    }
                                }, function (error, response, body) {
                                    console.log('Stage 1 {body.status}');

                                    if (body.status) {
                                        if (response.body.data.status === "success") {
                                            //good!!!!
                                            history.payment_status = "completed";
                                            history.driver_status = "completed";
                                            history.status = "completed";
                                            history.cost = cost;
                                            history.date_finished = Date.now();

                                            //  history.save( () => {
                                            //     console.log('Saved');
                                            //     console.log(history);
                                            //     // let dr =  this.getDriverHistories(history.driver);
                                            //     // return dr;
                                            //     return history;
                                            // }); 
                                            // history.save();
                                            // return history;
                                        } else {
                                            history.payment_status = null;
                                            history.driver_status = "completed";
                                            history.cost = cost;

                                            // history.save()
                                            // return history;
                                        }
                                    } else {
                                            // return body.message
                                        }
                                });

                            case 10:
                                _context3.next = 13;
                                break;

                            case 12:
                                if (driver_status == 'completed' && history.payment_method == 'CASH') {
                                    history.payment_status = 'completed';
                                    history.driver_status = 'completed';
                                    history.status = 'completed';
                                    history.date_finished = Date.now();
                                    history.cost = cost;

                                    // history.save()
                                    // return history;
                                } else {
                                    history.driver_status = driver_status;
                                    history.status = status;
                                    // history.cost = cost

                                    // history.save()
                                    // return history;
                                }

                            case 13:
                                _model2.default.token.find({ $or: [{ user: history.user }, { driver: history.driver }] }, function (err, token) {
                                    // model.token.find({user: history.user, driver: history.driver}, (err, token) => {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        console.log(token.length);
                                        if (token.length > 0) {
                                            token.forEach(function (element) {
                                                (0, _notification2.default)(element.token, 'Trip ' + driver_status, 'Driver has ' + driver_status + ' trip ' + (driver_status == 'completed' ? '- ₦' + cost : ''), element.type);
                                            });
                                        } else {
                                            // console.log("No token");
                                        }
                                    }
                                });

                                // history.save()
                                return _context3.abrupt('return', history.save(function () {
                                    console.log('Saved');
                                    // console.log(history);
                                    // let dr =  this.getDriverHistories(history.driver);
                                    // return dr;
                                    return history;
                                }));

                            case 15:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function processFareRequest(_x6, _x7, _x8, _x9) {
                return _ref3.apply(this, arguments);
            }

            return processFareRequest;
        }()
    }, {
        key: 'getTripById',
        value: function () {
            var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(id) {
                var trip;
                return regeneratorRuntime.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                _context4.next = 2;
                                return _model2.default.history.findById(id);

                            case 2:
                                trip = _context4.sent;


                                this.trip = trip;

                                return _context4.abrupt('return', trip);

                            case 5:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));

            function getTripById(_x10) {
                return _ref4.apply(this, arguments);
            }

            return getTripById;
        }()
    }]);

    return Trip;
}();

module.exports = Trip;
//# sourceMappingURL=Trip.js.map