'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var FCM = require('fcm-push');

var serverKey = '';

var notification = function notification(to, title, body, type) {
    if (type == "user") {
        serverKey = _config2.default.secret.user_token;
    } else {
        serverKey = _config2.default.secret.driver_token;
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

    var message = {
        "to": to,
        "content_available": true,
        "notification": {
            "title": title,
            "body": body
            // "click_action": "fcm.ACTION.HELLO"
        },
        "data": {
            "extra": "juice"
        }
        //promise style
    };fcm.send(message).then(function (response) {
        console.log("Successfully sent with response: ", response);
    }).catch(function (err) {
        console.log("Something has gone wrong!");
        console.error(err);
    });
};

exports.default = notification;

// exports.notification = function(to, data, notification, type) {
//     console.log("Hola");
//   };
//# sourceMappingURL=notification.js.map