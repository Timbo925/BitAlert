var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var request = require('request');
var util = require('util');
var async = require('async')
var Tx = require('../models/tx');
var Address = require('../models/address');

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


//MORE SPECIFICATION FOR EVENT MODEL

////////////////
//// SINGLE ////
////////////////

SingleSchema.add({
  address: String
})

//Create address from source
SingleSchema.methods.ini = function(user, callback) {
  var address = new Address()
  address.address = this.address;
  address.user =  user.id;
  address.source = this.id;
  address.save(function(err) {
    if (err) {callback(err)};
    callback(null)
  })
}

//Update single balance and SAVES it
SingleSchema.methods.updateBalance = function(callback) {
  var single = this;
  var url = "http://btc.blockr.io/api/v1/address/info/"
  url += this.address
  url +="?confirmations=0"
  request(url,
    function(err, res, body) {
      if (!err && res.statusCode == 200) {
        var json = JSON.parse(body);
        if(single.balanceSat == json.data.balance*10e8) {
          callback(null, false)
        } else {
          single.balanceSat = json.data.balance*10e8;
          single.save(function(err) {
            if (err) {callback(err)}
            callback(null, true)
          })
        }
      } else {
        callback(err)
      }
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
         addr.save(function(err) {
 //TODO TXAPPERANCES WILL NOT WORK
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
