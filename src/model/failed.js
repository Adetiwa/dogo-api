const mongoose = require('mongoose');

var failedSchema = new mongoose.Schema({
  auth: {
    type: String
  },
  amount: {
    type: Number,
  },
 email: {
    type: String
  },
  date:  { 
    type: Date, 
    default: Date.now
  }
 
});


module.exports = mongoose.model('Failed', failedSchema);
