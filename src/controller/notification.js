import { Router } from "express";
import Notification from "../model/notification";
import { authenticate } from "../middleware/authmiddleware";
import { adminAuthorization, userAuthentication } from "../middleware/adminAuth";
import { getID } from "../helpers/auth";


export default ({ config, db }) => {
  let api = Router();

  //'v1/foodtruck/add'
  api.post('/add', authenticate, (req, res) => {
    let newNotification = new Notification();
    newNotification.user = req.body.user;
    newNotification.text = req.body.text;
    newNotification.profile = req.body.profile;
    
    newNotification.save(err => {
    if (err) {
        res.status(403).json({status: false, msg: err});
        return;
    }
    Notification.find({}, (err, noti) => {
        if (err) {
        res.json({status: false, msg: err});
        return;
        }
        res.json({ status: true, message: "Notification successfully created", data: noti });
    });
    });
      
  });


  //'v1/foodtruck'
  api.get('/:id', authenticate, (req, res) => {
    Notification.find({user: req.params.id}, (err, noti) => {
      if (err) {
        res.status(403).json({status: false, msg: err});
        return;
      }
      res.json({status: true, data: noti});
    });
  });



  //'v1/foodtruck/:id' - DELETE
  api.delete('/:id', adminAuthorization, (req, res) => {
    Notification.findById(req.params.id, (err, noti) => {
      if (err) {
        res.status(500).send(err);
        return;
      }
      if (noti === null) {
        res.status(404).json({status: false, msg: "Notification not found"});
        return;
      }
      Notification.remove({
        "_id": req.params.id
      },(err, noti) => {
          if (err) {
            res.status(500).json({status: false, msg: err});
            return;
          }
          Notification.find({}, (err, noti) => {
            if (err) {
              res.status(403).json({status: false, msg: err});
              return;
            }
            res.json({ status: true, message: "Notification successfully deleted", data: noti });
          });
        });
    });
  });

  return api;
}
