import { Router } from "express";
import Fare from "../model/fare";
import { authenticate } from "../middleware/authmiddleware";
import { adminAuthorization, userAuthentication } from "../middleware/adminAuth";
import { getID } from "../helpers/auth";


export default ({ config, db }) => {
  let api = Router();

  //'v1/foodtruck/add'
  api.post('/add', adminAuthorization, (req, res) => {
    let type = req.body.type;
    Fare.find({type: type}, (err, fare) => {
      if (err) {
        if (err.errors.type.kind == 'enum') {
          res.status(403).json({status: false, msg: 'Invalid fare type'});
        } else {
          res.status(403).json({status: false, msg: err});
        }
        return;
      }
      if (fare.length == 0) {
         let newFare = new Fare();
            newFare.type = req.body.type;
            newFare.first_3_hours = req.body.first_3_hours;
            newFare.per_min = req.body.per_min;
            newFare.over_night_charge = req.body.over_night_charge;
            if (req.body.type == 'round_trip') {
              newFare.one_way_charge = 0;
            } else {
              newFare.one_way_charge = req.body.one_way_charge;
            }
            newFare.night_charge = req.body.night_charge;
            
            newFare.save(err => {
            if (err) {
              res.status(403).json({status: false, msg: err});
              return;
            }
            Fare.find({}, (err, fare) => {
              if (err) {
                res.status(403).json({status: false, msg: err});
                return;
              }
              res.json({ status: true, message: "Fare successfully created", data: fare });
            });
          });
      } else {
      
        Fare.find({}, (err, fare) => {
          if (err) {
            res.status(403).json({status: false, msg: err});
            return;
          }
          res.json({ status: false, msg: `Fare type of "${req.body.type}" has already been added`, data: fare });
        });
        
      }

    });
    
  });


  //'v1/foodtruck'
  api.get('/', authenticate, (req, res) => {
    Fare.find({}, (err, fares) => {
      if (err) {
        res.status(403).json({status: false, msg: err});
        return;
      }
      res.json({status: true, data: fares});
    });
  });




  //'v1/foodtruck/:id' - READ
  api.get('/:id', adminAuthorization, (req, res) => {
    Fare.findById(req.params.id, (err, fare) => {
      if (err) {
        res.status(500).json({status: false, msg: err});
        return;
      }
      res.json({status: false, data: fare});
    });
  });

  //'v1/foodtruck/:id' - UPDATE
  api.put('/', adminAuthorization, (req, res) => {
    var type = req.body.type;
    if (type) {
      Fare.findOneAndUpdate({type: type}, req.body, {new: true}, (err, fare) => {
        if (err) {
          res.status(403).json({status: false, msg: err});
          return;
        }
        if (fare) {
         
            Fare.find({}, (err, fares) => {
              if (err) {
                res.status(403).json({status: false, msg: err});
                return;
              }
              res.json({ status: true, message: "Fare successfully editted", data: fares });
            });
          
        } else {
          res.status(403).json({status: false, msg: "Fare type doesn't exist"});
        }

      });
      
     }
});

  //'v1/foodtruck/:id' - DELETE
  api.delete('/:id', adminAuthorization, (req, res) => {
    Fare.findById(req.params.id, (err, fare) => {
      if (err) {
        res.status(500).send(err);
        return;
      }
      if (fare === null) {
        res.status(404).json({status: false, msg: "Fare not found"});
        return;
      }
      Fare.remove({
        "_id": req.params.id
      },(err, fare) => {
          if (err) {
            res.status(500).json({status: false, msg: err});
            return;
          }
          Fare.find({}, (err, fares) => {
            if (err) {
              res.status(403).json({status: false, msg: err});
              return;
            }
            res.json({ status: true, message: "Fare successfully deleted", data: fares });
          });
        });
    });
  });

  return api;
}
