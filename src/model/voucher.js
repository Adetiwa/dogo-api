const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var voucherSchema = new mongoose.Schema({
  amount: {
    type: Number,
  },
  text: {
      type: String,
  },
  users: {
    type: Array,
  },
  used: {
    type: Array,
  },
  date: {
    type: Date,
    default: Date.now
  },
});



module.exports = mongoose.model('Voucher', voucherSchema);