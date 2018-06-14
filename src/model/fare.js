const mongoose = require('mongoose');

var fareSchema = new mongoose.Schema({
  id: {
    type: String
  },
  type: {
    type: String,
    enum : ['one_way','round_trip'],
  },
  first_3_hours: {
    type: Number,
  },
  per_min: {
    type: Number,
  },
  one_way_charge: {
    type: Number,
  },
  night_charge: {
    type: Number,
  },
  date:  { 
    type: Date, 
    default: Date.now
  }
 
});


module.exports = mongoose.model('Fare', fareSchema);
