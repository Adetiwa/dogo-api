import env from "dotenv";
env.config();
import 'babel-polyfill'
import http from "http";
import express from "express";
var app = express();
import bodyParser from "body-parser";
import passport from "passport";
import upload from "express-fileupload";
var cors = require('cors')
import {join} from 'path';
var server;
server = http.createServer(app);
const LocalStrategy = require('passport-local').Strategy;
import errorHandler from "./middleware/errorHandler";
import routes from "./routes";
import provider from "./providers";
import config from "./config";
let User = require('./model/user');
// console.log(process.env);
app.use(bodyParser.json());
app.use(upload());

app.use(bodyParser.urlencoded({
  extended: false
}));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Origin, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

app.use(cors());
// app.use(cors({credentials: true, origin: 'http://api.dogo.local'}))





//passport config
app.use(passport.initialize());
app.use(express.static(__dirname + '/public'));
// app.use(express.static(__dirname + '/uploads'));
const publicImages = express.static(join(__dirname, '../uploads/'));

// app.use('/public', publicPath);
app.use('/images', publicImages);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/emitter.html');
});

app.get('/olumide', (req, res) => {
  // res.sendFile(__dirname + '/emitter.html');
  res.json({status: true, data: "olumide"});
});
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
},
  User.authenticate()
));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




//api routes v1
app.use('/api/v1', routes);
provider.cron;
app.use(errorHandler);

server.listen(process.env.PORT || 3000, () => {
  console.log(`Started on port ${process.env.PORT} || ${config.secret.url}`);
})

// app.listen(config.port);

export default app;
