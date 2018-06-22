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
import { sendEmail, loadTemplate } from "../services/email";
import { transfrormObj, makeid, removeSpace } from "../helpers";


export default ({ config, db }) => {
  let api = Router();
  // 'v1/user'

  

    

  api.post('/register', async (req, res) => {
    let type = req.body.type;
    let tel = req.body.tel;
    let email = req.body.email;
    if (type == "driver") {
      if (!req.files) {
      return res.json({status: false, msg: 'No files were uploaded.'});
      } else if (!req.files.driver_license) {
        return res.json({status: false, msg: "Upload your driver's licence"});
      } else if (!req.files.profile_picture) {
        return res.json({status: false, msg: 'Upload your profile picture'});
      }
      var date  = new Date();
      var year = date.getFullYear();
      var month = date.getMonth();
      var day = date.getDate();
      var milli = date.getMilliseconds();
      var file_path_driver = "";
      var file_path_profile = "";
      var profile_url = "";
      var driver_url = "";
      var rand = makeid();
      
      if (req.files) {
        if (req.files.driver_license && req.files.profile_picture) {
          var driver_license = req.files.driver_license
          var profile_pic = req.files.profile_picture
          file_path_driver = process.cwd()+'/uploads/driver/'+rand+removeSpace(req.files.driver_license.name);
          file_path_profile = process.cwd()+'/uploads/profile/'+rand+removeSpace(req.files.profile_picture.name);
          profile_url = process.env.domain+"images/profile/"+rand+removeSpace(req.files.profile_picture.name);
          driver_url = process.env.domain+"images/driver/"+rand+removeSpace(req.files.driver_license.name);
          let movedriver = await driver_license.mv(file_path_driver, function(err) {
          });

          let moveprofile = await profile_pic.mv(file_path_profile, function(err) {
          });
        }
      
      }
      
      req.body.driver_licence = driver_url;
      req.body.profile_image = profile_url;
      
      var data = await transfrormObj(req.body);
      req.body = data;
      // console.log(data);
  }


    User.findOne({username: email, tel: tel}, (err, user) => {
      if(err) {
        res.status().send({status: false, msg: err});
        return;
      }
      
      if (user) {
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
              //send email 
             
              return res.status(200).send({status: true, msg: "Thank you for registering, we will notify you once we approve your account"});
              
            });
       
          } else if (type == 'user') {
            User.update(
              {_id: user._id}, 
              {
                $addToSet: {
                "type": "user"
              }
            }, (err, data) => {
              console.log(data)
            })
            
            user.save((err, user) => {
              if (err) {
                res.send({status: false, msg: err});
                return;
              }
               //send email 
             
              request.post({
                url: process.env.URL+'v1/user/login',
                json: { email: user.email, password: user.password }
              }, function(error, response, body){
                if (error) {
                  res.send({status: false, msg: error});
                  return;
                } else {
                  return res.status(200).send(response.body);
                }
            });
            }); 
          
          }
        }
        } else {
       
        if (type == 'user'){
        User.register(new User({ username: req.body.email, name: req.body.name, tel: req.body.tel, type: "user" }), req.body.password, (err, user) => {
          if (err) {
            if(err.code == 11000) {
              res.send({status: false, msg: 'This number has been used by an existing user'});
            } else {
              res.send({status: false, msg: err.message});
            }
            return;
          }
          passport.authenticate(
            'local', {
              session: false
            })(req, res, () => {
    
                request.post({
                    url: process.env.URL+'v1/user/login',
                    json: { email: req.body.email, password: req.body.first }
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
      } else if (type == 'driver'){
        User.register(new User({ username: req.body.email, name: req.body.name, last: req.body.last, first: req.body.first, tel: req.body.tel, type: "driver", driver_info: req.body.driver_info }), req.body.first, (err, user) => {
          if (err) {
            if(err.code == 11000) {
              res.send({status: false, msg: 'This number has been used by an existing user'});
            } else {
              res.send({status: false, msg: err.message});
            }
            return;
          }
          // passport.authenticate(
          //   'local', {
          //     session: false
          //   })(req, res, () => {
    
          //       request.post({
          //           url: process.env.URL+'v1/user/login',
          //           json: { email: req.body.email, password: req.body.password }
          //         }, function(error, response, body){
          //           if (error) {
          //             res.send({status: false, msg: error});
          //             return;
          //           } else {
          //             res.status(200).send(response.body);
          //           }
          //       });
      
          //   });

          return res.status(200).send({status: true, msg: "Thank you for registering, we will notify you once we approve your account"});
            
    
        });
        }
      }
      });
      
    });
    

    api.put('/edit', authenticate, (req, res) => {
      User.findById(req.body.user, (err, user) => {
        if (err) {
          res.status(500).json({status: false, msg: "A server error occured"});
          return;
        }
        
        user.name = req.body.name;
        user.tel = req.body.tel;
        if (req.body.driver_info) {
          user.driver_info = req.body.driver_info;
        }

        user.setPassword(req.body.password, (err, user) => {
          if (err) {
            res.status(500).json({status: false, msg: "A server error occured"});
            return;
          } 
          // user.
          user.save((err) => {
            if (err) {
              res.status(500).json({status: false, msg: "A server error occured"});
              return;
            } 
            request.post({
              url: process.env.URL+'v1/user/login',
              json: { email: user.email, password: req.body.password }
            }, function(error, response, body){
              if (error) {
                res.status(500).send({status: false, msg: error});
                return;
              } else {
                res.status(200).send({status: true, data: response.body});
              }
          });
  
         
          })  
        });
      })
    })



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
    User.findOne({username: req.body.email}, async (err, user) => {
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
      var link = process.env.domain+"change-password.php?u="+id+"&ui="+makeid()+"&email="+req.body.email;
      
      await sendEmail({
        from: "noreply@dogo.ng",
        to: req.body.email,
        subject: "Change your password",
        template: "reset",
        context: {
          link: link
         }
    });
      //send mail!!!!
        // we have deleted the user
        res.status(200).send({status: true, msg: `Hi, ${name}, Kindly check your mail`});
    });
  });


  api.put('/change_password', (req, res) => {
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
        // user.
        user.save((err) => {
          if (err) {
            res.status(500).json({status: false, msg: "A server error occured"});
            return;
          } 

          res.status(200).json({status: true, msg: "Password successfully changed", data: user});
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
