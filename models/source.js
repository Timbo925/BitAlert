var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var request = require('request');
var util = require('util');
var async = require('async')
var Tx = require('../models/tx');
var Address = require('../models/address');
var rf = require('../models/router_functions')
var bitcore = require('bitcore');
var Account = require('../models/account')

function sourceSchema() {
   Schema.apply(this, arguments)
   this.add({
      account: {type: Schema.Types.ObjectId, ref: 'Account'},
      label: String,
      balanceSat: {type:Number, default: 0},
      updated: {type: Date, default: Date.now, require: true},
      user: {type: Schema.Types.ObjectId, ref: 'User'}
   })


   this.pre('save', function(next){
     now = new Date();
     this.updated = now;
     next();
   });
}



util.inherits(sourceSchema, Schema)

var SourceSchema = new sourceSchema({}, {collection: 'source'}); //2 models located in same collection
var SingleSchema = new sourceSchema();
var XpubSchema = new sourceSchema();
var GreenSchema = new sourceSchema();

////////////////
//// SINGLE ////
////////////////

SingleSchema.add({
  address: String
})

//Create address from source
SingleSchema.methods.ini = function(user, cb) {
  var single = this;
  var address = new Address()
  address.address = single.address;
  address.user =  user.id;
  address.source = single.id;
  rf.getAddresses([address.address], 0, function(err, json) {
    address.balanceSat = json.data.balance*1e8;
    single.balanceSat = json.data.balance*1e8;
    Account.addSource(single, function(err) {
      address.save(function(err) {
        if (err) {return cb(err)}
        single.save(function(err) {
          if (err) {return cb(err)}
          cb();
        })
      })
    })
  })
}


////////////////
///// XPUB /////
////////////////

XpubSchema.add({
  xpubString: String,
  depth_internal: {type: Number, default: 0},
  depth_external: {type: Number, default: 0}
})

XpubSchema.methods.ini = function(user, callback) {
  var xpub = this;
  Account.addSource(xpub, function(err) {
    if (err) {callback(err)}
    xpub.fillBothUntil(user, function(err) {
      if (err) {callback(err)} //TODO remove all possible addresses linked to source
      callback(null)
    })

  })
}

XpubSchema.methods.fillBothUntil = function(user, callback) {
   var xpubInsta = this;
   xpubInsta.fillUntil(0,user,function(err){
      if (err) {return callback(err)}
      xpubInsta.fillUntil(1,user,function(err) {
         if (err) {return callback(err)}
         return callback(null)
      })
   })
}

XpubSchema.methods.fillUntil = function(type, user, callback) {
   var xpubInsta = this;
   if (parseInt(type) == 1) {depth = "depth_internal"} else {depth = "depth_external"}
   stop = false;
   async.until(
      function () {return stop == true},
      function(callback) {
         var pubKey = bitcore.HDPublicKey(xpubInsta.xpubString)
         var publicKey = pubKey.derive(parseInt(type)).derive(xpubInsta[depth]).toObject().publicKey;
         var addressStr = bitcore.PublicKey(publicKey).toAddress().toString();
         addr = new Address();
         addr.address = addressStr;
         addr.user = user.id;
         addr.source = xpubInsta.id;
         rf.getAddresses([addr.address], 0, function(err, data) {
           if (err) {return callback(err)}
           addr.balanceSat = data.data.balance*1e8
           xpubInsta.balanceSat += data.data.balance*1e8; //update source balance
           xpubInsta[depth]++
           console.log('NB_TXS: ' + data.data.nb_txs)
           if(data.data.nb_txs == 0) {stop = true} // Stop when we reached depth where no texts are found
           addr.save(function(err) {
             if (err) {callback(err)}
             callback();
           })
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

///////////////
//// GREEN ////
///////////////
// TODO

var Base = mongoose.model('Source', SourceSchema) //Saved under Source, no discrminator
var Single = Base.discriminator('single', SingleSchema); //Discriminator single
var Xpub = Base.discriminator('xpub', XpubSchema);
var Green = Base.discriminator('green', GreenSchema);

exports.Base = Base;
exports.Single = Single;
exports.Xpub = Xpub;
exports.Green = Green;
