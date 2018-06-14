import env from "dotenv";
env.config();

import jwt from "jsonwebtoken";


import expressJwt from "express-jwt";
import config from '../config';

const TOKENTIME =  60 * 60 * 24 * 30; //30 day
// const SECRET = process.env.SECRET;
// console.log(SECRET, '1');

let authenticate = expressJwt({
  secret: process.env.SECRET //process.env.SECRET
});


let generateAccessToken = (err, req, res, next) => {
  req.token = req.token || {};
  req.token = jwt.sign({
    id: req.user.id,
    type: req.user.type
  },
  process.env.SECRET, {
      expiresIn: TOKENTIME
  });
  // return req
  next();
}


let respond = (req, res, err) => {
  if (err) {
    res.send('error is '+err);
    return;
  }
  res.status(200).json({
    id: req.user.id,
    fullname: req.user.name,
    user: req.user.username,
    tel: req.user.tel,
    token: req.token,
    iat: req.user.iat,
    exp: req.user.exp,
    status: 'success'
  });
}

module.exports = {
  authenticate,
  generateAccessToken,
  respond

};
