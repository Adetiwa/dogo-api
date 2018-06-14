var schedule = require('node-schedule');
import History from "../model/history";
import Failed from "../model/failed";
import request from 'request';
import config from "../config";

var cronJob = schedule.scheduleJob('*/1 * * * *', function(){
  // console.log('Cron job runs every second!');

  History.find({status: "completed", payment_method: 'CARD', payment_status: null}, (err, trans) => {
    if (err) {
      console.log(err);
      return;
    }

    if (trans.length > 0) {
      trans.forEach(element => {
        request.post({
          url: 'https://api.paystack.co/transaction/charge_authorization',
          headers : {
            "Authorization" : "Bearer "+config.secret.paystack_token
          },
          json: { 
            authorization_code: element.card, 
            email: element.email,
            amount: element.cost * 100
            
          }
        }, function(error, response, body){
          if (response.body.data.status === "success") {
            //good!!!!
            console.log('One payment made');
            element.payment_status = "completed";
            element.driver_status = "completed";
            element.ref = response.body.data.reference;
            
            element.save();
          } 
        });  
      });
      
      
    }
  })
});

export default cronJob;