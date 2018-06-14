"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

var _express = require("express");

var _door = require("../model/door");

var _door2 = _interopRequireDefault(_door);

var _user = require("../model/user");

var _user2 = _interopRequireDefault(_user);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (_ref) {
  var config = _ref.config,
      db = _ref.db;

  var api = (0, _express.Router)();

  //'v1/foodtruck/add'
  api.post('/add', function (req, res) {
    var newFoodTruck = new FoodTruck();
    newFoodTruck.name = req.body.name;
    newFoodTruck.foodtype = req.body.foodtype;
    newFoodTruck.avgcost = req.body.avgcost;
    newFoodTruck.geometry.coordinates = req.body.geometry.coordinates;

    newFoodTruck.save(function (err) {
      if (err) {
        res.send(err);
      }
      res.json({ "message": "FoodTruck saved successfully" });
    });
  });

  //'v1/foodtruck'
  api.get('/', function (req, res) {
    FoodTruck.find({}, function (err, foodtrucks) {
      if (err) {
        res.send(err);
      }
      res.json(foodtrucks);
    });
  });

  //'v1/foodtruck/:id' - READ
  api.get('/:id', function (req, res) {
    FoodTruck.findById(req.params.id, function (err, foodtruck) {
      if (err) {
        res.send(err);
      }
      res.json(foodtruck);
    });
  });

  //'v1/foodtruck/:id' - UPDATE
  api.put('/:id', function (req, res) {
    FoodTruck.findById(req.params.id, function (err, foodtruck) {
      if (err) {
        res.send(err);
      }
      foodtruck.name = req.body.name;
      foodtruck.save(function (err) {
        if (err) {
          res.send(err);
        }
        res.json({ "message": "FoodTruck info updated!" });
      });
    });
  });

  //'v1/foodtruck/:id' - DELETE
  api.delete('/:id', function (req, res) {
    FoodTruck.findById(req.params.id, function (err, foodtruck) {
      if (err) {
        res.status(500).send(err);
        return;
      }
      if (foodtruck === null) {
        res.status(404).send("Foodtruck not found");
        return;
      }
      FoodTruck.remove({
        "_id": req.params.id
      }, function (err, foodtruck) {
        if (err) {
          res.status(500).send(err);
          return;
        }
        res.json({ message: "FoodTruck successfully removed!" });
      });
    });
  });

  //add review for specific foodtruck id
  // 'v1/foodtruck/reviews/add/:id'
  api.post('/reviews/add/:id', function (req, res) {
    FoodTruck.findById(req.params.id, function (err, foodtruck) {
      if (err) {
        res.send(err);
      }
      var newReview = new Review();
      newReview.title = req.body.title;
      newReview.text = req.body.text;
      newReview.foodtruck = foodtruck._id;

      newReview.save(function (err, review) {
        if (err) {
          res.send(err);
        }
        foodtruck.reviews.push(newReview);
        foodtruck.save(function (err) {
          if (err) {
            res.send(err);
          }
          res.json({ message: "Successfully saved review" });
        });
      });
    });
  });

  //get review for specific foodtruck id
  // 'v1/foodtruck/reviews/:id'
  api.get('/reviews/:id', function (req, res) {
    Review.find({ foodtruck: req.params.id }, function (err, reviews) {
      if (err) {
        res.send(err);
      }
      res.json(reviews);
    });
  });

  return api;
};
//# sourceMappingURL=door.js.map