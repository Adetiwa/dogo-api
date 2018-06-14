'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var historySchema = new mongoose.Schema({
  type: {
    type: String
  },
  pickup: {
    type: String,
    required: true
  },
  pickup_coords: {
    type: Object
  },
  dropoff: {
    type: String,
    required: true
  },
  dropoff_coords: {
    type: Object
  },
  cost: {
    type: Number
  },
  driver_status: {
    type: String,
    default: null
  },
  payment_method: {
    type: String
  },
  payment_token: {
    type: String
  },
  transaction_id: {
    type: String
  },
  payment_status: {
    type: String,
    default: null
  },
  status: {
    type: String,
    default: null
  },
  email: {
    type: String,
    default: null
  },
  rating: {
    type: Number,
    default: 0
  },
  km: {
    type: Number,
    default: 0
  },
  hr: {
    type: Number,
    default: 0
  },
  ref: {
    type: String,
    default: null
  },
  wantToRate: {
    type: Boolean,
    default: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  driver: {
    type: Schema.Types.ObjectId,
    ref: 'Driver',
    required: true
  },
  date: {
    type: Date
    // default: Date.now
  },
  date_finished: {
    type: Date
    // default: Date.now
  },
  card: {
    type: String,
    default: null
  }
});

module.exports = mongoose.model('History', historySchema);
//# sourceMappingURL=history.js.map