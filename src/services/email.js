
'use strict';
import env from "dotenv";
env.config();
import nodemailer from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';
import config from "../config";
let transporter = nodemailer.createTransport({
    host: 'smtp.mailgun.org',
    port: 465,
    secure: true,
    auth: {
        user: process.env.mailgunUser,
        pass: process.env.mailgunPass
    }
}); 

transporter.use('compile', hbs({
    viewPath: 'src/views/email',
    extName: '.hbs'
}))

function sendEmail(obj) {
    transporter.sendMail(obj, (err, res) => {
        if (err) {
            throw err;
            return;
        } 
        return;
    })
}

module.exports = { sendEmail}