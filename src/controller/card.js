import { Router } from "express";
import request from 'request';

import Card from "../model/card";
import { authenticate } from "../middleware/authmiddleware";
import config from "../config";
import { adminAuthorization, userAuthentication } from "../middleware/adminAuth";
import { getID } from "../helpers/auth";
import helpers from "../helpers";

var ip = require("ip");

export default ({ config, db }) => {
  let api = Router();

  //'v1/foodtruck/add'
  api.post('/add', authenticate, (req, res) => {
          request.post({
            url: 'https://api.paystack.co/charge',
            headers : {
                "Authorization" : "Bearer "+config.secret.paystack_token
            },
            json: { 
              user: req.body.user,
              email: req.body.email, 
              amount: 1,
              card: {
                number: req.body.number,
                cvv: req.body.cvv, 
                expiry_month: req.body.expiry_month,
                expiry_year: req.body.expiry_year
              },
              pin: req.body.pin,
              reusable: true
            }
          }, function(error, response, body){
            if (response.body.status) {
                if (response.body.data.status == 'send_otp') {
                  res.json({ status: true,
                      msg: response.body.data.display_text,
                      message: "send_otp", 
                      data: response.body.data });
                } else if (response.body.data.status == 'send_phone') {
                  res.json({ status: true,
                    msg: response.body.data.display_text,
                    message: "send_otp", 
                    data: response.body.data });
                } else if (response.body.data.status == 'success') {
                    let newCard = new Card();
                    newCard.user = req.body.user;
                    newCard.type = response.body.data.authorization.brand;
                    newCard.last4 = response.body.data.authorization.last4;
                    newCard.authorization_code = response.body.data.authorization.authorization_code;
                    newCard.signature = response.body.data.authorization.signature;
                    newCard.save(err => {
                    if (err) {
                        res.status(403).json({status: false, msg: err});
                        return;
                    }
                    Card.find({user: req.body.user}, (err, cards) => {
                        if (err) {
                            res.status(403).json({status: false, msg: err});
                            return;
                        }
                        res.json({ status: true, message: "success", data: cards });
                    });
                });
                } else {
                  res.json({ status: true,
                    msg: response.body.data.status,
                    message: response.body.data.status, 
                    data: response.body.data });
                }
                
            } else {
              res.status(200).json({status: false, msg: response.body.data.message});
              return;
         
            }
        });
 });



api.post('/send_otp', authenticate, (req, res) => {
  request.post({
    url: 'https://api.paystack.co/charge/submit_otp',
    headers : {
        "Authorization" : "Bearer "+config.secret.paystack_token
    },
    json: { 
      otp: req.body.otp, 
      reference: req.body.reference,
      pin: req.body.pin,
      user: req.body.user
    }
  }, function(error, response, body){
    if (response.body.status) {
        if (response.body.data.status == 'send_phone') {
          res.json({ status: true,
            msg: response.body.data.display_text,
            message: "send_otp", 
            data: response.body.data });
        } else if (response.body.data.status == 'success') {
            let newCard = new Card();
            newCard.user = req.body.user;
            newCard.pin = req.body.pin;
            newCard.type = response.body.data.authorization.brand;
            newCard.last4 = response.body.data.authorization.last4;
            newCard.authorization_code = response.body.data.authorization.authorization_code;
            newCard.signature = response.body.data.authorization.signature;
            newCard.save(err => {
            if (err) {
                res.status(403).json({status: false, msg: err});
                return;
            }
            Card.find({user: req.body.user}, (err, cards) => {
                if (err) {
                    res.status(403).json({status: false, msg: err});
                    return;
                }
                res.json({ status: true, message: "Card successfully created", data: cards });
            });
        });
      } else {
        res.json({ status: true,
          msg: response.body.data.status,
          message: response.body.data.status, 
          data: response.body.data });
      }
        
    } else {
      res.status(200).json({status: false, msg: response.body.data.message});
      return;
 
    }
});
});




  //'v1/foodtruck'
    api.get('/:id', authenticate, (req, res) => {
        Card.find({user: req.params.id}, (err, cards) => {
            if (err) {
            res.status(403).json({status: false, msg: err});
            return;
            }
            res.json({status: true, data: cards});
        });
    });

    api.post('/test', (req, res) => {
        let body = { 
          PBFPubKey: req.body.PBFPubKey,
          cardno: req.body.cardno,
          cvv: req.body.cvv,
          expirymonth: req.body.expirymonth,
          expiryyear: req.body.expiryyear,
          amount: req.body.amount,
          email: req.body.email,
          IP: ip.address(),
          txRef: "MC-"+ Date.now()
        }

        const secretKey = helpers.getKey('FLWSECK-02d3111b7b4b8c8e6ca40c320a0aab3f-X')
        const reqClient = helpers.encrypt(secretKey, JSON.stringify(body));

      request.post({
        url: 'https://api.ravepay.co/flwv3-pug/getpaidx/api/charge',
        headers : {
            "Authorization" : "Bearer FLWSECK-b2ddc3858f03ce8a02a8989a33b6333f-X",
            "Content-Type": "application/json"
        },
        json: {
            client: reqClient,
            PBFPubKey: req.body.PBFPubKey,
            // alg: "3DES-24"
        }
      }, function(error, response, body){
        console.log(JSON.stringify(body));
        return;
    });
  });

    

  //'v1/foodtruck/:id' - DELETE
  api.delete('/:id', authenticate, (req, res) => {
    Card.findById(req.params.id, (err, card) => {
      if (err) {
        res.status(500).send(err);
        return;
      }
      if (card === null) {
        res.status(404).json({status: false, msg: "Card not found"});
        return;
      }
      Card.remove({
        "_id": req.params.id
      },(err, card) => {
          if (err) {
            res.status(500).json({status: false, msg: err});
            return;
          }
          Card.find({user: req.params.user}, (err, cards) => {
            if (err) {
              res.status(403).json({status: false, msg: err});
              return;
            }
            res.json({ status: true, message: "Fare successfully deleted", data: cards });
          });
        });
    });
  });

  return api;
}
