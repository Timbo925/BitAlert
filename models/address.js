var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var request = require('request');
var util = require('util');
var async = require('async')
var Tx = require('../models/tx');

function addressScheme() {
   Schema.apply(this, arguments)
   this.add({
      addressStr: {type: String, required: true},
      user: {type: Schema.Types.ObjectId, ref: 'User'},
      label: String,
      updated: {type: Date, default: Date.now, require: true},
   })



   this.statics.getBalanceList = function (addrList, callback) {
      var url = "http://btc.blockr.io/api/v1/address/info/"
      for(var i = 0; i < addrList.length; i++) {
         url+= addrList[i].addressStr;
         if(i != addrList.length - 1) {url+= ","}
      }
      url +="?confirmations=0"
      console.log('Request' + url)
      request(url,
         function(error, response, body) {
            if (!error && response.statusCode == 200) {
               var res = JSON.parse(body);
               var balance = 0;
               var txApperances = 0;
               for(var i=0; i<res.data.length; i++) {
                  balance += res.data[i].balance
                  txApperances += res.data[i].nb_txs;
                  addrList[i].txApperances = res.data[i].nb_txs;
                  addrList[i].balance = res.data[i].balance
                  addrList[i].balanceSat = res.data[i].balance * 10e8;
               }
               callback(null, {balance: balance, balanceSat: balance*10e8, txApperances: txApperances, addr: addrList})
            } else {callback(error)}
         }
      )
   }

   this.statics.getAllBalance = function(user, callback) {
      var addr = this;
      addr
         .find({user:user.id})
         .lean()
         .exec(function(err,list) {
            if(err) {callback(err)}
            addr.getBalanceList(list,function(err, data) {
               if(err) {callback(err)}
               callback(null,data)
            })
         })
   }

   this.pre('save', function(next){
     now = new Date();
     this.updated = now;
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
