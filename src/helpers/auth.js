import config from '../config/secret';
import expressJwt from "express-jwt";
import jwt from "jsonwebtoken";

  let getID = (authentication) => {
    var auth = authentication;
    var token = auth.split(' ');
    try {
        var decoded = jwt.verify(token[1], process.env.SECRET);
        //console.log(JSON.stringify(decoded))
         console.log("expires: in "+new Date(decoded.exp * 1000));
        //console.log(expiryTime(decoded.exp, decoded.iat))
        return decoded.id;
    } catch(err) {
      res.status(403).json({status: false, msg: err.message})
      return;
    }
  }

  let expiryTime = (time, iat) => {
    var timestamp = iat || Math.floor(Date.now() / 1000);

     if (typeof time === 'string') {
       var milliseconds = ms(time);
       if (typeof milliseconds === 'undefined') {
        return;
       }
       return Math.floor(timestamp + milliseconds / 1000);
     } else if (typeof time === 'number' ) {
       return timestamp + time;
     } else {
       return;
     }
    }


module.exports = {
  getID,
  expiryTime
}
