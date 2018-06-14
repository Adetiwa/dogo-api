import mongoose from "mongoose";
import { Router } from "express";
// import Door from "../model/door";
import Activity from "../model/activity";
import History from "../model/history";
import User from "../model/user";
import Shares from "../model/shares";
import { generateAccessToken, respond, authenticate } from "../middleware/authmiddleware";
import { adminAuthorization, userAuthentication } from "../middleware/adminAuth";
import { getID } from "../helpers/auth";


export default ({ config, db }) => {
  let api = Router();



  api.get('/', adminAuthorization, (req, res) => {
    Activity.find({}, (err, activities) => {
      if (err) {
        res.status(403).json({status: false, msg: err});
        return;
      }
      res.json(activities);
    });
  });


  api.get('/cost', adminAuthorization, (req, res) => {
    var cost = 0;
    History.find({status: "completed"}, async (err, history) => {
      if (err) {
        res.status(403).json({status: false, msg: err});
        return;
      }
      if (history.length == 0) {
        res.status(200).json({status: true, cost: 0});
        return;
      } else {
       await history.forEach((element) => {
         cost += element.cost;
        });
        res.json({status: true, cost: cost});
      }
    });
  });

  api.get('/users', adminAuthorization, (req, res) => {
    var cost = 0;
    User.find({type: 'user '}, async (err, users) => {
        if (err) {
          res.status(403).json({status: false, msg: err});
          return;
        }
        res.json({status: true, users: users.length});
      });
  });

  api.get('/drivers', adminAuthorization, (req, res) => {
    User.find({type: 'driver'}, async (err, driver) => {
        if (err) {
          res.status(403).json({status: false, msg: err});
          return;
        }
        res.json({status: true, drivers: driver.length});
      });
  });
  


  api.get('/history', adminAuthorization, (req, res) => {
    History.find({}, (err, history) => {
        if (err) {
          res.status(403).json({status: false, msg: err});
          return;
        }
        // var his= [];
        // history.forEach((element) => {
        //   User.find({})
        // });
        res.json({status: true, history: history.length, data: history});
      });
  });
  

  api.get('/transfer', adminAuthorization, async (req, res) => {
    // Shares.find
      let allHistories = await History.find({ fundsRemitted: false, status: 'completed', payment_status: 'completed', payment_method: 'CARD' })
      let shares = await Shares.findOne({})
      // console.log(allHistories);
      // return;
      
      let response = []
      let responseData = new Promise((resolve, reject) => {
        try {
          if (allHistories.length > 0) {
            allHistories.forEach(async (historyObject) => {
              let currentUser = await User.findById(historyObject.user)
              let currentDriver = await User.findById(historyObject.driver)
              // console.log("I got here");
              // console.log(currentUser);
              // console.log(currentDriver);
      
              // let userObj = {
              //     id: currentUser._id,
              //     name: currentUser.name,
              //     type: currentUser.type,
              //     tel: currentUser.tel,
              //     username: currentUser.username
              //   }
                let money = {
                  amount: Math.round(historyObject.cost * ((shares.driver_percent)/100)),
                  share: shares.driver_percent
                }
                
    
    
                let driverObj = {
                  id: currentDriver._id,
                  name: currentDriver.name,
                  type: currentDriver.type,
                  tel: currentDriver.tel,
                  username: currentDriver.username,
                  recipient: currentDriver.driver_info.recipient ? currentDriver.driver_info.recipient : null,
                  account_info: currentDriver.driver_info.account_info

                }
    
                let resObj = {driver: driverObj, money: money, histories: historyObject}
              
                response.push(resObj)
                return resolve(response)
            })
          } else {
                 response = [];
                return resolve(response)
          }
        } catch (e) {
          return reject(e)
        }
      })
  
      let data = await responseData
      res.json({status: true, data: data});
    
  });
  

  




  return api;
}
