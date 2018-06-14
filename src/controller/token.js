import mongoose from "mongoose";
import { Router } from "express";
import bodyParser from "body-parser";
import FcmToken from "../model/token";
import User from "../model/user";
import { authenticate } from "../middleware/authmiddleware";
import { userAuthentication } from "../middleware/adminAuth";
import notification from "./../services/notification";
import { sendEmail, loadTemplate } from "../services/email";


export default ({ config, db }) => {
  let api = Router();

  //'v1/foodtruck/add'
  api.post('/add', authenticate, (req, res) => {
        let fcmToken = new FcmToken();
        FcmToken.find({token: req.body.token}, (err, token) => {
          if (err) {
           res.json({ status: false, msg: 'here'  });
           return;
         } else if ((token == null) || (token == '')) {
             fcmToken.token = req.body.token;
             fcmToken.device = req.body.device;
             fcmToken.user = req.body.user;
             fcmToken.type = req.body.type;
             fcmToken.save(err => {
               if (err) {
                 res.json({ status: false, msg: err });
                 return;
               }
               res.json({ status: true, msg: "success" });
             });
           } else {
             res.json({ status: true, msg: "token already saved" });
           }
        })

      });


  api.post('/push-test/:id', (req, res) => {
    FcmToken.find({user: req.params.id}, (err, token) => {
      if (err) {
        console.log(err);
        res.status(500).json({status: false, msg: "A server error occured"});
      } else {
        if (token.length > 0) {
          token.forEach(element => {
            notification(element.token, "Hello world", "To olumidde!!!!", element.type);
          });
        } else {
          // console.log("No token");
        }
        res.json({status: true, data: token.token}); 
      }
    });
  });    



  let users = [
    {
        name: "Adetiwa Olumide",
        email: "adetiwa1@gmail.com"
    }
]

  api.post('/push-email', async (req, res) => {
   
       await sendEmail({
          from: "noreply@dogo.ng",
          to: "adetiwa1@gmail.com",
          subject: "Welcome to Dogo",
          template: "welcome",
          context: {
            fullname: "Adetiwa Olumide",
            link: "https://www.google.com"
           }
      });
        res.json({status: true, msg: "Message sent"});
      return;
   
  });    


  //'v1/foodtruck/:id' - DELETE
  api.delete('/:id', (req, res) => {
 
    FcmToken.findById(req.params.id).remove((err, token) => {
      if (err) {
        res.status(500).json({status: false, msg: "A server error occured"});
      } else {
        // we have deleted the user
        // FcmToken.remove({
        //   "_id": req.params.id
        // },(err, token) => {
        //   if (err) {
        //     res.status(500).json({status: false, msg: err});
        //     return;
        //   }
        
        res.status(200).json({status: true, message: "success"});
        // });
     }
    });

  });



  return api;
}
