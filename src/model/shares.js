const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var sharesSchema = new mongoose.Schema({
driver_percent: {
    type: Number
  },
 
  admin_percent: {
    type: Number
  },
 
});

module.exports = mongoose.model('Shares', sharesSchema);