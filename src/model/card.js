const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var cardSchema = new mongoose.Schema({
user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
},
type: {
    type: String,
  },
  last4: {
    type: String,
  },
  authorization_code: {
    type: String,
  },
  signature: {
    type: String,
  },
  pin: {
    type: String,
  },
  date:  { 
    type: Date, 
    default: Date.now
  }
 
});


module.exports = mongoose.model('Card', cardSchema);
