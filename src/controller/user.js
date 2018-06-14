import mongoose from "mongoose";
import { Router } from "express";
import User from "../model/user";
import Driver from "../model/driver";
import bodyParser from "body-parser";
import passport from "passport";
import config from "../config";
import bcrypt from 'bcryptjs';
import request from 'request';
import FcmToken from "../model/token";

import { generateAccessToken, respond, authenticate } from "../middleware/authmiddleware";
import { adminAuthorization, userAuthentication } from "../middleware/adminAuth";
import { getID } from "../helpers/auth";

export default ({ config, db }) => {
  let api = Router();
  // 'v1/user'

  api.post('/register', (req, res) => {
    let type = req.body.type;
    let tel = req.body.tel;
    let email = req.body.email;
    
    User.findOne({username: email, tel: tel}, (err, user) => {
      if(err) {
        res.status(500).send({status: false, msg: err});
        return;
      }
      
      if (user !== null) {
        let thisUserType = user.type;
        if (thisUserType.includes(type)) {
          //throw error
          res.status(200).send({status: false, msg: `This account is already a ${type} account`});
          return;
        
        } else {
          if (type == 'driver') {
            user.driver_info = req.body.driver_info;
            User.update(
              {_id: user._id}, 
              {
                $addToSet: {
                "type": "driver"
              }
            }, (err, data) => {
              console.log(data)
            })
            
            user.save((err, user) => {
              if (err) {
                res.status(500).send({status: false, msg: err});
                return;
              }
              // res.status(500).send({status: true, msg: 'Driver saved'});
              request.post({
                url: config.secret.url+'v1/user/login',
                json: { email: req.body.email, password: req.body.password }
                }, function(error, response, body){
                  if (error) {
                    res.status(500).send({status: false, msg: error});
                    return;
                  } else {
                    res.status(200).send(response.body);
                  }
              });
              
              return;
            });
            return;
            // user.type = user.type.push('driver');
            // user.driver_info = req.body.user_info;
            // user.save((err, user) => {
            //   if (err) {
            //     res.status(500).send({status: false, msg: err});
            //     return;
            //   }
            //   res.status(500).send({status: false, msg: 'Driver saved'});
            // });
          } 
          //login!!!
          
          //   request.post({
          //     url: config.secret.url+'v1/user/login',
          //     json: { email: user.email, password: user.password }
          //   }, function(error, response, body){
          //     if (error) {
          //       res.status(500).send({status: false, msg: error});
          //       return;
          //     } else {
          //       res.status(200).send(response.body);
          //     }
          // });
          return;
          }
        }  else if (req.body.type == 'user'){
        User.register(new User({ username: req.body.email, name: req.body.name, tel: req.body.tel, type: req.body.type }), req.body.password, (err, user) => {
          if (err) {
            if(err.code == 11000) {
              res.status(500).send({status: false, msg: 'This number has been used by an existing user'});
            } else {
              res.status(500).send({status: false, msg: err.message});
            }
            return;
          }
          passport.authenticate(
            'local', {
              session: false
            })(req, res, () => {
    
                request.post({
                    url: config.secret.url+'v1/user/login',
                    json: { email: req.body.email, password: req.body.password }
                  }, function(error, response, body){
                    if (error) {
                      res.status(500).send({status: false, msg: error});
                      return;
                    } else {
                      res.status(200).send(response.body);
                    }
                });
    
            });
    
        });
      } else if (req.body.type == 'driver'){
        User.register(new User({ username: req.body.email, name: req.body.name, tel: req.body.tel, type: req.body.type, driver_info: req.body.driver_info }), req.body.password, (err, user) => {
          if (err) {
            if(err.code == 11000) {
              res.status(500).send({status: false, msg: 'This number has been used by an existing user'});
            } else {
              res.status(500).send({status: false, msg: err.message});
            }
            return;
          }
          passport.authenticate(
            'local', {
              session: false
            })(req, res, () => {
    
                request.post({
                    url: config.secret.url+'v1/user/login',
                    json: { email: req.body.email, password: req.body.password }
                  }, function(error, response, body){
                    if (error) {
                      res.status(500).send({status: false, msg: error});
                      return;
                    } else {
                      res.status(200).send(response.body);
                    }
                });
    
            });
    
        });
      }
      });
      
    });
    


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
            // user: user,
              id: user._id,
              fullname: user.name,
              email: user.username,
              tel: user.tel,
              type: user.type,
              token: token,
              driver_info: user.driver_info,
              iat: user.iat,
              exp: user.exp,
              status: true
          })
      } else {
        // If user is not found
        res.status(200).json({status: false, msg: 'Email or password is incorrect'});
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





  api.get('/', adminAuthorization, (req, res) => {
    User.find({}, (err, users) => {
      if (err) {
        res.status(500).json({status: false, msg: "A server error occured"});
        return;
      }
        // we have deleted the user
        res.status(200).send({status: true, data: users});
    });
  });

   api.get('/drivers', adminAuthorization, (req, res) => {
    User.find({type: 'driver'}, (err, drivers) => {
      if (err) {
        res.status(500).json({status: false, msg: "A server error occured"});
        return;
      }
        // we have deleted the user
        res.status(200).send({status: true, data: drivers});
    });
  });


  api.post('/forgot', (req, res) => {
    User.findOne({username: req.body.email}, (err, user) => {
      if (err) {
        res.status(500).json({status: false, msg: "A server error occured"});
        return;
      }
      if(!user) {
        res.json({status: false, msg: "This email doesn't exist"});
        return;
      }
      var id = user._id;
      var name = user.name;
      //send mail!!!!
        // we have deleted the user
        res.status(200).send({status: true, msg: `Hi, ${name}, Kindly check your mail`});
    });
  });


  api.put('/change_password', authenticate, (req, res) => {
    User.findById(req.body.user, (err, user) => {
      if (err) {
        res.status(500).json({status: false, msg: "A server error occured"});
        return;
      }
      if (!user) {
        res.status(500).json({status: false, msg: "User doesn't exist"});
        return;
      }
      user.setPassword(req.body.password, (err, user) => {
        if (err) {
          res.status(500).json({status: false, msg: "A server error occured"});
          return;
        } 
        user.save((err) => {
          if (err) {
            res.status(500).json({status: false, msg: "A server error occured"});
            return;
          } 

          res.status(200).json({status: false, msg: "Password successfully changed", data: user});
          return;
       
        
        })  
      });
    })
  })


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

  
  return api;
}
