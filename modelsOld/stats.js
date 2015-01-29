var mongoose = require('mongoose')
var Schema = mongoose.Schema;
var Address = require('../models/address')

 var statsSchema = new Schema({
     balance: Number
});

//Returns difference of the update, makes it possible to guess transaction size.
statsSchema.methods.updateBalance = function(callback) {
  var stats = this;
  Address.Base.getAllBalance(function(err, data) {
    if (err) {callback(err)}
    var difference = 0;
    if (stats.balanceSat != data.balance*10e8) {
      difference = data.balance*10e8 - stats.balance;
      stats.balanceSat = data.balance*10e8;
      stats.save(function(err) {
        if (err) {callback(err)}
        callback(null, difference)
      })
    } else {
      callback(null, 0)
    }
  })
}

module.exports = mongoose.model('Stats', statsSchema);
