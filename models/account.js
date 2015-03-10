var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Source = require('../models/source')

var accountSchema = new Schema({
   label: String,
   user: {type: Schema.Types.ObjectId, ref:'User'},
   sources: [{type: Schema.Types.ObjectId, ref: 'Source'}]
});

accountSchema.statics.addSource = function(source, callback) {
   this
   .findOne({_id: source.account})
   .exec(function(err, account) {
      if (err) {callback(err)}
      if (!account) {callback(new Error("Account number not found"))}
      console.log(account)
      account.sources.push(source)
      account.save(function(err) {
         if (err) {callback(err)}
         callback(null)
      })
   })
}

//Retruns balance of the account
accountSchema.methods.getBalance = function(callback) {
   var total = 0;
   console.log(this.sources)
   if (this.sources.length == 0) {callback(null, total)}
   else {
      this
      .populate('sources', function(err, list) {
         console.log(list)
         for (var i = 0; i < list.sources.length; i++) {
            total += list.sources[i].balanceSat;
         }
         callback(null,total)
      })
   }
}

module.exports = mongoose.model('Account', accountSchema);
