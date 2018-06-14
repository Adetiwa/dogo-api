const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var notifySchema = new mongoose.Schema({
  profile: {
    type: String,
  },
  user: {
    type: String
  },
  text: {
    type: String,
    },
  date:  { 
    type: Date, 
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', notifySchema);