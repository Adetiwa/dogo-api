'use strict'
require('dotenv').config()
var FCM = require('fcm-push');
import config from "../config";
var serverKey = '';
    
const notification = function(to, title, body, type) {
    if (type == "user") {
        serverKey = process.env.user_token;
    } else {
        serverKey = process.env.driver_token;
    }
    var fcm = new FCM(serverKey);

    // let message = {
    //     to: to, // required fill with device token or topics
    //     registration_ids: to,
    //     priority: 'high',
    //     collapse_key: 'your_collapse_key', 
    //     data: data,
    //     notification: {
    //         'body': 'uje',
    //         'title': 'titleenefwef'
    //     }
    // }

    let message = {
            "to":to,
            "content_available": true,
            "notification": {
                "title": title,
                "body": body
                // "click_action": "fcm.ACTION.HELLO"
            },
            "data": {
                "extra":"juice"
            }
    }
    //promise style
    fcm.send(message)
    .then(function(response){
        console.log("Successfully sent with response: ", response);
    })
    .catch(function(err){
        console.log("Something has gone wrong!");
        console.error(err);
    })
}



export default notification


// exports.notification = function(to, data, notification, type) {
//     console.log("Hola");
//   };
  

