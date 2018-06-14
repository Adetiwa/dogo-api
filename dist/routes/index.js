"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require("express");

var _express2 = _interopRequireDefault(_express);

var _config = require("../config");

var _config2 = _interopRequireDefault(_config);

var _middleware = require("../middleware");

var _middleware2 = _interopRequireDefault(_middleware);

var _db = require("../config/db");

var _db2 = _interopRequireDefault(_db);

var _user = require("../controller/user");

var _user2 = _interopRequireDefault(_user);

var _token = require("../controller/token");

var _token2 = _interopRequireDefault(_token);

var _fare = require("../controller/fare");

var _fare2 = _interopRequireDefault(_fare);

var _activity = require("../controller/activity");

var _activity2 = _interopRequireDefault(_activity);

var _history = require("../controller/history");

var _history2 = _interopRequireDefault(_history);

var _driver = require("../controller/driver");

var _driver2 = _interopRequireDefault(_driver);

var _card = require("../controller/card");

var _card2 = _interopRequireDefault(_card);

var _support = require("../controller/support");

var _support2 = _interopRequireDefault(_support);

var _notification = require("../controller/notification");

var _notification2 = _interopRequireDefault(_notification);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = (0, _express2.default)();

//connect to db
(0, _db2.default)(function (db) {
  //internal middleware
  router.use((0, _middleware2.default)({ config: _config2.default, db: db }));
  // api routes v1 (/v1)
  router.use('/user', (0, _user2.default)({ config: _config2.default, db: db }));
  router.use('/token', (0, _token2.default)({ config: _config2.default, db: db }));
  router.use('/fare', (0, _fare2.default)({ config: _config2.default, db: db }));
  router.use('/activity', (0, _activity2.default)({ config: _config2.default, db: db }));
  router.use('/history', (0, _history2.default)({ config: _config2.default, db: db }));
  router.use('/driver', (0, _driver2.default)({ config: _config2.default, db: db }));
  router.use('/card', (0, _card2.default)({ config: _config2.default, db: db }));
  router.use('/support', (0, _support2.default)({ config: _config2.default, db: db }));
  router.use('/notification', (0, _notification2.default)({ config: _config2.default, db: db }));
});

exports.default = router;
//# sourceMappingURL=index.js.map