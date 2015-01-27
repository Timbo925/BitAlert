var mongoose = require('mongoose')
var Schema = mongoose.Schema;
var bitcore = require('bitcore');
var request = require('request');
var async = require('async');
var Address = require('../models/address')

var txSchema = new Schema({
     txid: {type:String, required: true},
     user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
     created_at: {type: Date, deafault: Date.now},
     updated_at: {type: Date, deafault: Date.now},
     label: String,
     amount: Number,
     fees: Number
});

txSchema.methods.updateTx = function(callback) {
  var tx = this;
  request('https://insight.bitpay.com/api/tx/' + tx.txid,
       function(error, response, body) {
          if (!error && response.statusCode == 200) {
             var res = JSON.parse(body);
             tx.txid = res.txid;
             tx.amount = res.valueOut - res.valueIn;
             tx.fees = res.fees;
             tx.save(function(err) {
               if(err) {callback(err)}
               callback(null)
             })
          } else {callback(error)}
       }
    )
}


txSchema.pre('save', function(next){
   this.updated_at = new Date();
   next();
 });

module.exports = mongoose.model('TX', txSchema);
