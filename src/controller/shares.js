import { Router } from "express";
import Shares from "../model/shares";
import { authenticate } from "../middleware/authmiddleware";
import { adminAuthorization, userAuthentication } from "../middleware/adminAuth";
import { getID } from "../helpers/auth";


export default ({ config, db }) => {
  let api = Router();

  //'v1/foodtruck/add'
  api.post('/add', adminAuthorization, (req, res) => {
    Shares.find({}, (err, share) => {
      if (err) {
        res.status(403).json({status: false, msg: err});
        return;
      }
    if (share.length == 0) {
         let newShare = new Shares();
            newShare.driver_percent = req.body.driver_percent;
            newShare.admin_percent = Number(100 - req.body.driver_percent);
            
            newShare.save(err => {
            if (err) {
              res.status(403).json({status: false, msg: err});
              return;
            }
            Shares.find({}, (err, share) => {
              if (err) {
                res.status(403).json({status: false, msg: err});
                return;
              }
              res.json({ status: true, message: "Share successfully created", data: share });
            });
          });
      } else {
      
        Shares.find({}, (err, share) => {
            if (err) {
              res.status(403).json({status: false, msg: err});
              return;
            }
            res.json({ status: true, message: "Share successfully created", data: share });
          });
      }

    });
    
  });


  //'v1/foodtruck'
  api.get('/', adminAuthorization, (req, res) => {
    Shares.find({}, (err, shares) => {
      if (err) {
        res.status(403).json({status: false, msg: err});
        return;
      }
      res.json({status: true, data: shares});
    });
  });




  //'v1/foodtruck/:id' - UPDATE
api.put('/:id', adminAuthorization, (req, res) => {
    Shares.findById((req.params.id), (err, shares) => {
        shares.driver_percent = req.body.driver_percent;
        shares.admin_percent = Number(100 - req.body.driver_percent);
        shares.save((err)=> {
            if (err) {
                res.status(403).json({status: false, msg: err});
                return;
            } else {
                Shares.find({}, (err, shares) => {
                    if (err) {
                      res.status(403).json({status: false, msg: err});
                      return;
                    }
                    res.json({status: true, data: shares});
                  });
            }
        })
        
    })
});

  return api;
}
