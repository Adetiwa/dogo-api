const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var fcmTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
  },
  device: {
    type: String,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    default: 'user',
  },
  date : { type : Date, default: Date.now }
});

module.exports = mongoose.model('FcmToken', fcmTokenSchema);
