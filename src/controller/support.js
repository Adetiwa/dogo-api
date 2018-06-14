import { Router } from "express";
import Support from "../model/support";
import { authenticate } from "../middleware/authmiddleware";
import { adminAuthorization, userAuthentication } from "../middleware/adminAuth";
import { getID } from "../helpers/auth";


export default ({ config, db }) => {
  let api = Router();

  //'v1/foodtruck/add'
  api.post('/add', authenticate, (req, res) => {
    let newSupport = new Support();
    newSupport.category = req.body.category;
    newSupport.text = req.body.text;
    newSupport.title = req.body.title;
    
    newSupport.save(err => {
    if (err) {
        res.status(403).json({status: false, msg: err});
        return;
    }
    Support.find({}, (err, support) => {
        if (err) {
        res.status(403).json({status: false, msg: err});
        return;
        }
        res.json({ status: true, message: "Support successfully created", data: support });
    });
    });
      
  });


  //'v1/foodtruck'
  api.get('/', authenticate, (req, res) => {
    Support.find({}, (err, supports) => {
      if (err) {
        res.status(403).json({status: false, msg: err});
        return;
      }
      res.json({status: true, data: supports});
    });
  });



  //'v1/foodtruck/:id' - DELETE
  api.delete('/:id', adminAuthorization, (req, res) => {
    Support.findById(req.params.id, (err, support) => {
      if (err) {
        res.status(500).send(err);
        return;
      }
      if (support === null) {
        res.status(404).json({status: false, msg: "support not found"});
        return;
      }
      Support.remove({
        "_id": req.params.id
      },(err, support) => {
          if (err) {
            res.status(500).json({status: false, msg: err});
            return;
          }
          Support.find({}, (err, support) => {
            if (err) {
              res.status(403).json({status: false, msg: err});
              return;
            }
            res.json({ status: true, message: "Support successfully deleted", data: support });
          });
        });
    });
  });

  return api;
}
