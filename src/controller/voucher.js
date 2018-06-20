import { Router } from "express";
import request from 'request';

import Voucher from "../model/voucher";
import { authenticate } from "../middleware/authmiddleware";
import config from "../config";
import { adminAuthorization, userAuthentication } from "../middleware/adminAuth";
import { getID } from "../helpers/auth";
import helpers from "../helpers";
import notification from "../services/notification";
import FcmToken from "../model/token";

var ip = require("ip");

export default ({ config, db }) => {
  let api = Router();

  //'v1/foodtruck/add'
    api.post('/add', adminAuthorization, (req, res) => {
        Voucher.find({text: req.body.text}, (err, voucher) => {
            if (err) {
                res.json({status: false, msg: err});
                return;
              }

              if (voucher.length > 0) {
                res.status(200).json({status: false, msg: "Voucher with this text already exists"});
                return;
              }

              let newVoucher = new Voucher();
              newVoucher.text = req.body.text;
              newVoucher.amount = req.body.amount;
              newVoucher.save((err) => {
                if (err) {
                    res.json({ status: false, msg: err });
                    return;
                }

                FcmToken.find({}, (err, token) => {
                    if (err) {
                      res.status(500).json({status: false, msg: "A server error occured"});
                    } else {
                      if (token.length > 0) {
                        token.forEach(element => {
                            if (element.type == "user") {
                                notification(element.token, "New Voucher", `Enter '${req.body.text}' and get ₦ ${req.body.amount} off your next trip`, "user");
                            }
                        });
                      }
                    }
                  });

                  
                res.json({ status: true, msg: "success" });
                
            })
        })            
    });


    api.post('/add/user', authenticate, (req, res) => {
        Voucher.findOne({text: req.body.text}, (err, voucher) => {
            if (err) {
                res.json({status: false, msg: err});
                return;
              } 
              if (voucher) {
                if (voucher.users.includes(req.body.user)) {
                  res.json({status: false, msg: "This code is being used by you" });
                } else if (voucher.used.includes(req.body.user)) {
                  res.json({status: false, msg: "This code has already been used by you" });
                
                } else {
                    //add to user list 
                    Voucher.update(
                        {text: req.body.text}, 
                        {
                          $addToSet: {
                          "users": req.body.user
                        }
                      }, (err, data) => {
                        FcmToken.find({user: req.body.user}, (err, token) => {
                            if (err) {
                              res.status(500).json({status: false, msg: "A server error occured"});
                            } else {
                              if (token.length > 0) {
                                token.forEach(element => {
                                  notification(element.token, "Yipee", `You have successfully added new voucher for your next trip`, element.type);
                                });
                              }
                            }
                          });


                        Voucher.find({users: req.body.user}, (err, vouchers) => {
                            if (err) {
                                res.json({status: false, msg: err});
                                return;
                              }
                
                              res.json({status: true, msg: `You have successfully added new voucher for your next trip`, data: vouchers });
                        });
                      })
                    
                }
              } else {
                res.json({status: false, msg: "This is an invalid voucher code" });
              }

              
        });
    });


    api.get('/:id', authenticate, (req, res) => {
        Voucher.find({users: req.params.id}, (err, vouchers) => {
            if (err) {
                res.json({status: false, msg: err});
                return;
              }

              res.json({status: true, data: vouchers });
        });
    });

    api.get('/', adminAuthorization, (req, res) => {
        Voucher.find({}, (err, vouchers) => {
            if (err) {
                res.json({status: false, msg: err});
                return;
              }

              res.json({status: true, data: vouchers });
        });
    });

    
    api.delete('/user', (req, res) => {
            // Voucher.update({_id: req.body.voucher_id},
            //     { $pull: {users: { $in: req.body.user }},
                
            // },  (err, data) => {
            // if (err) {
            //     reject(err);
            //     }
            //     return res.json({status: true})
      
           
                Voucher.findById(req.body.voucher_id, (err, v) => {
                    if (err) {
                        console.log(err);
                        }

                        v.users.remove(req.body.user);
                        v.save();
                });
       
    });



  //'v1/foodtruck/:id' - DELETE
  api.delete('/:id', adminAuthorization, (req, res) => {
    Voucher.findById(req.params.id, (err, card) => {
      if (err) {
        res.json({status: false, msg: err});
        return;
      }
      if (card === null) {
        res.status(404).json({status: false, msg: "Voucher not found"});
        return;
      }
      Voucher.remove({
        "_id": req.params.id
      },(err, voucher) => {
          if (err) {
            res.status(500).json({status: false, msg: err});
            return;
          }
   
            res.json({ status: true, message: "Fare successfully deleted"});
         
        });
    });
  });

  return api;
}
