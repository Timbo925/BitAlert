var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

 var addressScheme = new Schema({
     addressStr: {type: String, required: true},
     balanceSat: {type: Number},
     user: {type: Schema.Types.ObjectId, ref: 'User'},
     label: String,
     xpub: {type: Schema.Types.ObjectId, ref: 'Xpub'},
     xpubtype : {type: Number}
});

module.exports = mongoose.model('Address', addressScheme);
