import { Router } from "express";
import User from "../model/user";
import Driver from "../model/driver";
import History from "../model/history";
import bodyParser from "body-parser";
import passport from "passport";
import config from "../config";
import bcrypt from 'bcryptjs';
import request from 'request';
import FcmToken from "../model/token";

import { generateAccessToken, respond, authenticate } from "../middleware/authmiddleware";
import { userAuthentication,adminAuthorization } from "../middleware/adminAuth";
import { getID } from "../helpers/auth";

export default ({ config, db }) => {
  let api = Router();
  // 'v1/user'




  // 'v1/account/login'

  api.post('/login', (req, res) => {
     passport.authenticate('local', function(err, user, info){
      var token;

      // If Passport throws/catches an error
      if (err) {
        res.status(404).json({status: false, msg: err});
        return;
      }

      // If a user is found
      if(user){
         let token = user.generateJwt();
        res.status(200).json({
          user: user,
            //   fullname: user.name,
            //   email: user.username,
            //   tel: user.tel,
            //   type: user.type,
          token: token,
          iat: user.iat,
          exp: user.exp,
          status: true
        })
      } else {
        // If user is not found
        res.status(401).json({status: false, msg: 'Email or password is incorrect'});
      }
    })(req, res)
  });



  api.get('/logout/:id', authenticate, (req, res) => {
    FcmToken.find({ user: req.params.id }).remove((err, token) => {
      if (err) {
        res.status(500).json({status: false, msg: "A server error occured"});
      } else {
        // we have deleted the user
        req.logout();
        res.status(200).send({status: true, msg: 'success'});
     }
    });
  });

  
  api.get('/getdriver/:id', authenticate, (req, res) => {
    User.find({ driver_info: { $ne: null }, _id: {$ne: req.params.id}, "driver_info.busy": false, "driver_info.active": true, "driver_info.verified": true }).limit(20).exec( (err, drivers) => {
      if (err) {
            res.status(500).json({status: false, msg: "A server error occured"});
            return;
        }
       if (drivers.length == 0) {
            res.status(500).json({status: true, data: [], msg: "No driver is available"});
            return;
        } else {
            res.status(500).json({status: true, data: drivers});
            return;
        }
   });
  });


  api.get('/:id', authenticate, (req, res) => {
    User.findById(req.params.id, (err, user) => {
      if (err) {
          if (err.name == "CastError") {
            res.status(403).json({status: false, msg: 'Invalid data!'});
          } else {
            res.status(403).json({status: false, msg: err});
          }
        return;
      }
      res.json({status: true, data: user});
    });
  });



  api.put('/verifyDriver', adminAuthorization, (req, res) => {
    
    User.findById(req.body.id, (err, user) => {
      if (err) {
        res.status(403).json({status: false, msg: err});
        return
      }
      if (!user) {
        res.json({status: false, msg: "This driver does not exist"});
        return
        
      }
      User.update({_id: req.body.id}, {'$set': {
        'driver_info.verified': JSON.parse(req.body.status)
      }},  (err, data) => {
        if (err) {
          res.status(403).json({status: false, msg: err});
          return
        }
        res.json({status: true, msg:"success" })
    })
  });
});


api.put('/update', authenticate, (req, res) => {
    User.findById(req.body.id, (err, user) => {
      if (err) {
          if (err.name == "CastError") {
            res.status(403).json({status: false, msg: 'Invalid data!'});
          } else {
            res.status(403).json({status: false, msg: err});
          }
        return;
      }

      if (!user) {
        res.status(500).json({status: false, msg: "User doesn't exist"});
        return;
      }

      User.findOne({ _id: req.body.id }).exec( async (err, user) => {
        if (err) {
          res.status(403).json({status: false, msg: err});
          return;
        }
        if (!user) {
          res.status(403).json({status: false, msg: 'User not found'});
          return;
        }
        if (user.driver_info.busy) {
          res.status(403).json({status: false, msg: 'You cannot go offline, you have an active trip!'});
          return;
        }
         User.update({_id: req.body.id}, {
          $set: {
            "driver_info.active": req.body.state
          }
        }, (err, value) => {
          // console.log(value)
        })

        try {
          let resUser = await User.findById(req.body.id)
          res.status(200).json({status: true, msg: "Success", data: resUser});
        } catch (Error) {
          res.status(500).json({status: false, msg: "A server error occured"});
        }
        // User.findById(req.body.id, (err, user) => {
        //   if (err) {
        //     res.status(500).json({status: false, msg: "A server error occured"});
        //     return;
        //   } 

        //   res.status(200).json({status: true, msg: "Success", data: user});
         
        // });
      });
    });
  });


  return api;
}
