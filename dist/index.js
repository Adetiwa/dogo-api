"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _dotenv = require("dotenv");

var _dotenv2 = _interopRequireDefault(_dotenv);

require("babel-polyfill");

var _http = require("http");

var _http2 = _interopRequireDefault(_http);

var _express = require("express");

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require("body-parser");

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _passport = require("passport");

var _passport2 = _interopRequireDefault(_passport);

var _errorHandler = require("./middleware/errorHandler");

var _errorHandler2 = _interopRequireDefault(_errorHandler);

var _routes = require("./routes");

var _routes2 = _interopRequireDefault(_routes);

var _providers = require("./providers");

var _providers2 = _interopRequireDefault(_providers);

var _config = require("./config");

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_dotenv2.default.config();

var app = (0, _express2.default)();

var server;
server = _http2.default.createServer(app);
var LocalStrategy = require('passport-local').Strategy;

var User = require('./model/user');
// console.log(process.env);
app.use(_bodyParser2.default.json());

app.use(_bodyParser2.default.urlencoded({
  extended: false
}));

//passport config
app.use(_passport2.default.initialize());
app.use(_express2.default.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/emitter.html');
});
_passport2.default.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, User.authenticate()));
_passport2.default.serializeUser(User.serializeUser());
_passport2.default.deserializeUser(User.deserializeUser());

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Origin, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

//api routes v1
app.use('/api/v1', _routes2.default);
_providers2.default.cron;
app.use(_errorHandler2.default);

server.listen(process.env.PORT || 3000, function () {
  console.log("Started on port " + process.env.PORT + " || " + _config2.default.secret.url);
});

// app.listen(config.port);

exports.default = app;
//# sourceMappingURL=index.js.map