var mongoose = require('mongoose')
var Schema = mongoose.Schema;
var bitcore = require('bitcore');
var request = require('request');
var async = require('async');
var Address = require('../models/address')

var xpubSchema = new Schema({
     xpub: String,
     user: {type: Schema.Types.ObjectId, ref: 'User'},
     label: String,
     depth_internal: {type: Number, default: 0},
     depth_external: {type:Number, default: 0}
});

xpubSchema.statics.getUserXpub = function (user, callback) {
  this
    .find({user:user.id})
    .exec(function(err, xpubs) {
      if (err) {return callback(err)}
      var xpubList = []
      async.eachSeries(xpubs, function(key, callback) {
        Address
        .find({user:user.id, xpub:key.id})
        .exec(function(err, addrs) {
          var balance = 0;
          for(var i=0; i<addrs.length; i++) {
            balance += addrs[i].balanceSat;
          }
          xpubList.push({xpub: key, balanceSat: balance})
          callback();
        })
      },function(err) {
        console.log(xpubList)
        callback(null, xpubList)
      }
      )
    })
}

xpubSchema.statics.getXpubBalances = function(xpub,from,to, type ,callback) {
   var pubKey = bitcore.HDPublicKey(xpub)
   console.log('PubKey: ' + pubKey)
   var keys = [];
   for(var i = from; i < to; i++) {
      var publicKey = pubKey.derive(type).derive(i).toObject().publicKey;
      var addressStr = bitcore.PublicKey(publicKey).toAddress().toString();
      keys.push(addressStr);
   }

   console.log(keys)

   var responsemessage = {
      xpub: pubKey.toString(),
      from: from,
      to: to,
      type: type,
      addr: []}

   async.eachSeries(keys,
      function(key, callback) {
         request('https://insight.bitpay.com/api/addr/' + key,
         function(error, response, body) {
            if (!error && response.statusCode == 200) {
               var ret = JSON.parse(body);
               var address = new Object();
               address.addressStr = ret.addrStr;
               address.balanceSat = ret.balanceSat;
               responsemessage.addr.push(address);
               callback();
            }
            else {
               callback(error)
            }
         }
      )
   }, function(err) {
      if(err) {return callback(err)}
      else {
         return callback(null, responsemessage)
      }
      }
   )
}

xpubSchema.methods.fillBothUntil = function(user, callback) {
   var xpubInsta = this;
   xpubInsta.fillUntil(0,user,function(err){
      if (err) {return callback(err)}
      xpubInsta.fillUntil(1,user,function(err) {
         if (err) {return callback(err)}
         return callback(null)
      })
   })
}

xpubSchema.methods.fillUntil = function(type, user, callback) {
   var xpubInsta = this;
   if (parseInt(type) == 1) {depth = "depth_internal"} else {depth = "depth_external"}
   stop = false;
   async.until(
      function () {return stop == true},
      function(callback) {

         var pubKey = bitcore.HDPublicKey(xpubInsta.xpub)
         var publicKey = pubKey.derive(parseInt(type)).derive(xpubInsta[depth]).toObject().publicKey;
         var addressStr = bitcore.PublicKey(publicKey).toAddress().toString();
         addr = new Address();
         addr.addressStr = addressStr;
         addr.user = user.id;
         addr.xpub = xpubInsta.id;
         addr.xpubtype = parseInt(type);
         addr.label = xpubInsta.label;
         addr.updateAddress(function(err) {
           if (addr.txApperances == 0) {stop = true}
           xpubInsta[depth]++; //increase the depth of the added values
           callback();
         })
      },
      function(err) {
         if (err) {return callback(err)};
         xpubInsta.save(function (err) {
            if(err) {return callback(err)}
            return callback(null)
         })
      }
   )
}

module.exports = mongoose.model('Xpub', xpubSchema);
