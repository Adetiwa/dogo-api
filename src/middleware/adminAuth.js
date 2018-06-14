import env from "dotenv";
env.config();

import User from "../model/user";
import jwt from "jsonwebtoken";
import expressJwt from "express-jwt";
import config from '../config';

let adminAuthorization = (req, res, next) => {
  var auth = req.headers.authorization;
  if (auth) {
    var token = auth.split(' ');
    try {
        var decoded = jwt.verify(token[1], process.env.SECRET);
        if (decoded.type.includes('admin')) {
            next();
        } else {
          res.status(403).json({status: false, msg: "You have no access to this resource"})
          return;
        }
      } catch(err) {
        res.status(403).json({status: false, msg: err.message})
        return;
      }
    } else {
      res.status(403).json({status: false, msg: "Authorization-Token is required"})
      return;
    }

}


let userAuthentication = (req, res, next) => {
  var auth = req.headers.authorization;
  if (auth) {
    
    var token = auth.split(' ');
    try {
        var decoded = jwt.verify(token[1], process.env.SECRET);
        next(decoded.id);
      } catch(err) {
        res.status(403).json({status: false, msg: err.message})
        return;
      }
    } else {
      res.status(403).json({status: false, msg: "Authorization-Token is required"})
      return;
    } 
}


module.exports = {
  adminAuthorization,
  userAuthentication
};
