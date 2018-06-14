const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
import passportLocalMongoose from "passport-local-mongoose";
import config from '../config';
import expressJwt from "express-jwt";
import jwt from "jsonwebtoken";

const Schema = mongoose.Schema;

var supportSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
  },
  title: {
    type: String
  },
  text: {
    type: String,
    },
  date:  { 
    type: Date, 
    default: Date.now
  }
});

module.exports = mongoose.model('Support', supportSchema);