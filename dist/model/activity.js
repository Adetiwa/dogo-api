'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// import Door from './door';

var activitySchema = new mongoose.Schema({
  type: {
    type: String
  },
  user: {
    type: String,
    required: true
  },
  percentage: {
    type: Number
  },
  link: {
    type: String
  },
  ref: {
    type: String
  },
  seen: {
    type: Boolean,
    default: false
  },
  // door: {
  //   type: Schema.Types.ObjectId,
  //   ref: 'Door',
  //   required: true
  // },
  date: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model('Activity', activitySchema);
//# sourceMappingURL=activity.js.map