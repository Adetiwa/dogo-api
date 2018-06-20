import env from "dotenv";
env.config();
import { Router } from "express";
import History from "../model/history";
import User from "../model/user";
import Fare from "../model/fare";
import FcmToken from "../model/token";
import Voucher from "../model/voucher";

import {  authenticate } from "../middleware/authmiddleware";
import { adminAuthorization } from "../middleware/adminAuth";
import { getID } from "../helpers/auth";
import notification from "../services/notification";
import Notification from "../model/notification";
import serviceFare from './../services/fare'

import { sendEmail, loadTemplate } from "../services/email";

export default ({ config, db }) => {
  let api = Router();

  function formatDate(date) {
    var monthNames = [
      "January", "February", "March",
      "April", "May", "June", "July",
      "August", "September", "October",
      "November", "December"
    ];
  
    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();
  
    return day + ' ' + monthNames[monthIndex] + ' ' + year;
  }

  function getMinute(createdTime) {
    let currentTime =  new Date()
    let newdate = new Date(createdTime)
    let minutes = ((currentTime - newdate)/60000);

    return Math.round(minutes/60)
}


  api.post('/', authenticate, (req, res) => {
    History.find({$and: [{user: req.body.user}, {status: { $ne: "cancelled" }}, {status: { $ne: "completed" }}]}, (err, userFind) => {
      if (err) {
        res.json({status: false, code: 100, msg: err});
        return;
      }

      if (userFind.length > 0) {
        res.json({status: false, code: 101, msg: "You have an active trip going to. Reload your app, and have a good connection"});
        return;
      }
   
      
      History.find({$and: [{driver: req.body.driver}, {status: { $ne: "cancelled" }}, {status: { $ne: "completed" }}]}, (err, driverFind) => {
        if (err) {
          res.json({status: false, code: 100, msg: err});
          return;
        }
  
        if (driverFind.length > 0) {
          res.json({status: false, code: 101, msg: "Oops! This driver just got busy. Try with another active driver"});
          return;
        }




        User.findById(req.body.user, (err, driver) => {
          if (err) {
            res.json({status: false, code: 100, msg: err});
            return;
          }
    
          if (driver == null) {
            res.json({status: false, code: 101, msg: "Wow This driver doesn't exist"});
            return;
          }
    
          if (driver.driver_info.busy) {
            res.json({status: false,code: 102, msg: "Wow This driver just became busy with another trip"});
            return;
          }
          
        
        let history = new History();
        history.type = req.body.type;
        history.pickup = req.body.pickup;
        history.dropoff = req.body.dropoff;
        history.cost = req.body.cost;
        history.hr = req.body.hr;
        history.km = req.body.km;
        history.date = new Date().toISOString();
        // history.driver_status = req.body.driver_status;
        history.payment_method = req.body.payment_method;
        // history.payment_status = req.body.payment_status;
        // history.status = req.body.status;
        history.email = req.body.email;
        history.voucher_id = req.body.voucher_id;
        history.voucher = req.body.voucher;
        history.user = req.body.user;
        history.pickup_coords = req.body.pickup_coords;
        history.dropoff_coords = req.body.dropoff_coords;
        
        history.driver = req.body.driver;
        history.card = req.body.card;
        // history.transaction_id = req.body.transaction_id;
        history.save(err => {
        if (err) {
            res.json({ status: false, msg: err });
            return;
        }
            User.update({_id: req.body.driver}, {'$set': {
              'driver_info.busy': true,
              'driver_info.active': true
              
            }},  (err, data) => {
              if (err) {
                res.status(403).json({status: false, msg: err});
                return
              }
              // res.json({status: true, msg:"success" })
          })
        
        ///NOTIFY_DRIVER/// 
        FcmToken.find({user: req.body.driver}, (err, token) => {
          if (err) {
            res.status(500).json({status: false, msg: "A server error occured"});
          } else {
            if (token.length > 0) {
              token.forEach(element => {
                notification(element.token, "Trip Assignment", "A trip has ben assigned to you", element.type);
              });
            }
          }
        });

    
    
        History.find({user: req.body.user}, (err, histories) => {
          if (err) {
            res.status(403).json({status: false, msg: err});
            return;
          }
          res.json({status: true, data: histories, driver: driver});
          });
        
          });
        });
      });
    });
});



  api.get('/all', adminAuthorization,  async (req, res) => {
    let allHistories = await History.find({})
    let response = []
    let responseData = new Promise((resolve, reject) => {
      try {
        allHistories.forEach(async (historyObject) => {
          let currentUser = await User.findById(historyObject.user)
          let currentDriver = await User.findById(historyObject.driver)

          let userObj = {
              id: currentUser._id,
              name: currentUser.name,
              type: currentUser.type,
              tel: currentUser.tel,
              username: currentUser.username
            }


            let driverObj = {
              id: currentDriver._id,
              name: currentDriver.name,
              type: currentDriver.type,
              tel: currentDriver.tel,
              username: currentDriver.username
            }

          let resObj = {user: userObj, driver: driverObj, histories: historyObject}
          
            response.push(resObj)
            return resolve(response)
        })
      } catch (e) {
        return reject(e)
      }
    })

    let data = await responseData
    res.json({status: true, data: data});
  
  });


  api.put('/mark', adminAuthorization, (req, res) => {
    History.findById(req.body.id, (err, history) => {
      if (err) {
        res.status(403).json({status: false, msg: err});
        return
      }

      history.fundsRemitted = true;
      history.save((err)=> {
        if (err) {
          res.status(403).json({status: false, msg: err});
          return
        }
        res.json({status: true, msg:"success" })
      })        
    })
  });


  api.put('/transfer', adminAuthorization, (req, res) => {
    History.findById(req.body.id, (err, history) => {
      if (err) {
        res.status(403).json({status: false, msg: err});
        return
      }

      // call paystack's endpoint!!!!!;

      // history.fundsRemitted = true;
      // history.save((err)=> {
      //   if (err) {
      //     res.status(403).json({status: false, msg: err});
      //     return
      //   }
      //   res.json({status: true, msg:"success" })
      // })        
    })
  });


  api.post('/rate', authenticate, async (req, res) => {
    History.findById(req.body.id, (err, history) => {
      if (err) {
        res.json({status: false, msg: err});
        return
      }
      if (history == null) {
        res.json({status: false, msg: "This order doesn't exist"});
        return;
      }
      if (req.body.rated) {
        history.rating = req.body.rating;
        history.rated = true;
        
      } else {
        history.rating = 3;
        history.rated = true;
        
      }
      history.save((err) => {
        if (err) {
          res.json({status: false, msg: err});
          return
        }
        User.findById(history.driver, async (err, driver) => {
          if (err) {
            res.json({status: false, msg: err});
            return
          }
          let totalNumber = await History.find({driver: history.driver});
          let average = Math.round(( Number(req.body.rating) + Number(driver.driver_info.rating) ) / (totalNumber.length));
          //update driver rating !!!
          if (isNaN(average)) {
            average = 3;
          } else if (average > 5) {
            average = 5;
          }
          User.update({_id: history.driver}, {'$set': {
            'driver_info.rating': average
          }},  (err, data) => {
            if (err) {
              res.status(403).json({status: false, msg: err});
              return
            }
            FcmToken.find({user: history.driver}, (err, token) => {
              if (err) {
                res.status(500).json({status: false, msg: "A server error occured"});
              } else {
                if (token.length > 0) {
                  token.forEach(element => {
                    notification(element.token, "Trip accessment", `You got a ${req.body.rating} star rating on your last trip`, element.type);
                  });
                }
              }
            });

            res.json({status: true, msg: "Updated ratings!"})
        })

      })

    })
  });
});






  api.post('/cancel', authenticate, (req, res) => {
    History.findById(req.body.id, (err, history) => {
        if (err) {
          if (err.name == "CastError") {
            res.status(403).json({status: false, msg: 'Invalid data!'});
          } else {
            res.status(403).json({status: false, msg: err});
          }
        return;
      }
      if (history == null) {
        res.status(403).json({status: false, msg: "This order doesn't exist"});
        return;
      }
      if (history.driver_status != null) {
        res.status(403).json({status: false, msg: "This order cannot be cancelled as the driver already started"});
        return;
      } else {
        history.status = "cancelled";
        history.driver_status = "cancelled";
        history.save(err => {
          if (err) {
              res.json({ status: false, msg: err });
              return;
          }

          ///NOTIFY_DRIVER/// 

         
        History.find({user: req.body.user}, (err, histories) => {
          if (err) {
            res.status(403).json({status: false, msg: err});
            return;
          }
          res.json({status: true, data: histories, driver: null});
          });
        
      });
        
    }
  
    })
  });

  api.get('/:id', authenticate, (req, res) => {
    History.find({user: req.params.id}, (err, histories) => {
      if (err) {
          if (err.name == "CastError") {
            res.status(403).json({status: false, msg: 'Invalid data!'});
          } else {
            res.status(403).json({status: false, msg: err});
          }
        return;
      }
      res.json({status: true, data: histories,driver: null});
    });
  });

  api.get('/driver/:id', authenticate, (req, res) => {
    History.find({driver: req.params.id}, (err, histories) => {
      if (err) {
          if (err.name == "CastError") {
            res.status(403).json({status: false, msg: 'Invalid data!'});
          } else {
            res.status(403).json({status: false, msg: err});
          }
        return;
      }
      res.json({status: true, data: histories,driver: null});
    });
  });
  


  api.put('/:id', authenticate, async (req, res) => {
    try {
      let history = await serviceFare.trip.processFareRequest(req.params.id, req.body.status, req.body.driver_status, process.env.paystack_token);
      // console.log(history);
      let usSave = await history.save( async (err) => {
          if (err) {
           res.json({status: false, msg: err})
             return;
           }

           User.findById(history.user, async (err, user) => {
            if (err) {
                console.log(err);
            } else {
                await sendEmail({
                    from: "noreply@dogo.ng",
                    to: user.username,
                    subject: "Trip Completed",
                    template: "invoice",
                    context: {
                      date: formatDate(new Date()),
                      distance: `${history.distance} km`,
                      duration: `${getMinute(history.date)} Hours`,
                      coupon: `${history.voucher ? "- ₦" +history.voucher : "0"}`,
                      total: `‎₦ ${history.cost}`,
                      pickup: `‎${history.pickup}`, 
                      destination: `‎${history.dropoff}`,

                     }
                });
            }
          });

           if (req.body.driver_status == 'completed') {
           let vow = await Voucher.findById(history.voucher_id, async (err, v) => {
              if (err) {
                  console.log(err);
                  }

                  v.users.remove(history.user);
                  v.used.push(history.user)
                  v.users.set(history.user, null);
                  v.save();
            });
          }



          let histories = await History.find({driver: history.driver}, async (err, histories) => {
          if (err) {
            res.json({status: false, msg: err})
            return;
          } 
          
               
          return res.json({status: true, data: histories, thisdata: history})
          
          });
       
      });
      
     
    } catch (Error) {
      res.status(200).json({status: false, msg: Error})
    }
  });
  

  api.delete('/:id', adminAuthorization, (req, res) => {
 
    History.findById(req.params.id).remove((err, history) => {
      if (err) {
        res.status(500).json({status: false, msg: err.messsage});
      } else {
        History.find({}, (err, histories) => {
            if (err) {
            res.status(403).json({status: false, msg: err});
            return;
            }
            res.json({ status: true, message: "History successfully created", data: histories });
        });
     }
    });

  });


  return api;
}
