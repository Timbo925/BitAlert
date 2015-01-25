var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var request = require('request');
var util = require('util');

function addressScheme() {
   Schema.apply(this, arguments)
   this.add({
      addressStr: {type: String, required: true},
      balanceSat: {type: Number, default: 0},
      user: {type: Schema.Types.ObjectId, ref: 'User'},
      label: String,
      txApperances: Number,
      totalSentSat: Number,
      totalReceivedSat: Number,
      updated: {type: Date, default: Date.now, require: true}
   })


   this.statics.getBalance = function (user, callback) {
      this.find({user:user.id}, function(err,addrList) {
         if (err) {callback(err)}
         var balance = 0;
         for (var i = 0; i < addrList.length; i++) {
            balance = balance + addrList[i].balanceSat
         }
         return callback(null, balance)
      })
   }

   this.methods.updateAddress = function(callback) {
      var addr = this;
      request('https://insight.bitpay.com/api/addr/' + addr.addressStr,
         function(error, response, body) {
            if (!error && response.statusCode == 200) {
               var ret = JSON.parse(body);
               res = true
               if(addr.balanceSat == ret.balanceSat) {res = false}
               addr.balanceSat = ret.balanceSat;
               addr.txApperances = ret.txApperances;
               addr.totalSentSat = ret.totalSentSat;
               addr.totalReceivedSat = addr.totalReceivedSat;
               addr.save(function(err) {
                  callback(null, res, addr)
               })
            } else {callback(error)}
         }
      )
   }

   this.pre('save', function(next){
     now = new Date();
     this.updated_at = now;
     next();
   });
}



util.inherits(addressScheme, Schema)

var AddressSchema = new addressScheme({}, {collection: 'addresses'}); //2 models located in same collection
var SingleSchema = new addressScheme();
var XpubSchema = new addressScheme();


//MORE SPECIFICATION FOR EVENT MODEL

XpubSchema.add({
   xpub: {type: Schema.Types.ObjectId, ref: 'Xpub'},
   xpubtype : {type: Number},
})

var Base = mongoose.model('address', AddressSchema)
var Single = Base.discriminator('single', SingleSchema);
var Xpub = Base.discriminator('xpub', XpubSchema);

exports.Base = Base;
exports.Single = Single;
exports.Xpub = Xpub;
