var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Source = require('../models/source')

var accountSchema = new Schema({
  balanceSat: {type: Number, default: 0},
  label: String,
  user: {type: Schema.Types.ObjectId, ref:'User'}
});

module.exports = mongoose.model('Account', accountSchema);
