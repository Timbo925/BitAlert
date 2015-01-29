var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var addressSchema = new Schema({
  address: String,
  user: {type: Schema.Types.ObjectId, ref:'User'},
  source: {type: Schema.Types.ObjectId, ref:'Source'},
  balanceSat: Number
});

module.exports = mongoose.model('Address', addressSchema);
