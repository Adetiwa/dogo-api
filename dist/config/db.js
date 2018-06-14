"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

var _index = require("./index.js");

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('dotenv').config();

exports.default = function (callback) {
  _mongoose2.default.connect(_index2.default.secret.database);
  callback(db);
  var db = _mongoose2.default.connection;
  db.on('open', function () {
    console.log('connected to the database');
  });

  db.on('error', function (error) {
    console.log('Database connection error ' + error);
  });
};
//# sourceMappingURL=db.js.map