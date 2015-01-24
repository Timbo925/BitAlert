var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var request = require('request')

 var addressScheme = new Schema({
     addressStr: {type: String, required: true},
     balanceSat: {type: Number, default: 0},
     user: {type: Schema.Types.ObjectId, ref: 'User'},
     label: String,
     xpub: {type: Schema.Types.ObjectId, ref: 'Xpub'},
     xpubtype : {type: Number}
});

addressScheme.statics.getBalance = function (user, callback) {
   this.find({user:user.id}, function(err,addrList) {
      if (err) {callback(err)}
      var balance = 0;
      for (var i = 0; i < addrList.length; i++) {
         balance = balance + addrList[i].balanceSat
      }
      return callback(null, balance)
   })
}

addressScheme.methods.updateBalance = function(callback) {
   var addr = this;
   request('https://insight.bitpay.com/api/addr/' + addr.addressStr,
      function(error, response, body) {
         if (!error && response.statusCode == 200) {
            var ret = JSON.parse(body);
            res = true
            if(addr.balanceSat == ret.balanceSat) {res = false}
            addr.balanceSat = ret.balanceSat;
            addr.save(function(err) {
               callback(null, res, addr)
            })
         } else {callback(error)}
      }
   )
}

module.exports = mongoose.model('Address', addressScheme);
