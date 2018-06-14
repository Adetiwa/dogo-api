
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _nodemailer = require('nodemailer');

var _nodemailer2 = _interopRequireDefault(_nodemailer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Create a SMTP transporter object
var transporter = _nodemailer2.default.createTransport({
    streamTransport: true,
    newline: 'unix',
    buffer: true,
    // use a normalizer method for header keys
    normalizeHeaderKey: function normalizeHeaderKey(key) {
        return key.toUpperCase();
    }
}, {
    // default message fields

    // sender info
    from: 'Test <no-reply@stackonly.com>',
    headers: {
        'X-Laziness-level': 1000 // just an example header, no need to use this
    }
});

// Message object
var message = {
    to: 'Adetiwa Olumide <adetiwa1@gmail.com>',
    subject: 'Nodemailer is unicode friendly ✔',
    text: 'Hello to myself!',
    html: '<p><b>Hello</b> to myself <img src="cid:note@example.com"/></p>'
};

var send = function send() {

    transporter.sendMail(message, function (error, info) {
        if (error) {
            console.log('Error occurred');
            console.log(error.message);
            // return process.exit(1);
        } else {
            console.log("Message sent");
        }

        // console.log(info.envelope);
        // console.log(info.messageId);
        // console.log(info.message.toString());
    });
};

exports.default = send;
//# sourceMappingURL=email.js.map