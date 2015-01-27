var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var Address = require('../models/address')

 var userSchema = new Schema({
     username: {type:String, require: true},
     firstname: String,
     lastname: String,
     password: String,
     email: String,
     stats : {type: Schema.Types.ObjectId, ref: 'Stats', required: true}
});


//Checks if user exist with the following options
userSchema.statics.free = function(options, callback) {
   var query = this.findOne();
   for (key in options) {
      var reg = new RegExp('^' + options[key].trim() + '(\\s*)$', 'i')
      query.where(key).regex(reg)
   }
   console.log("Checking if free: " + query)
   query.exec(function(err, result) {
      console.log(result)
      if (err) return callback(err)
      else if (result) return callback(null, false)
      else return callback(null, true)
   })
}



//edit field from the current user. Not existing values won't be saved by mongoose
userSchema.methods.edit = function(options, callback) {
      for (key in options) {
         this[key] = options[key]
      }
      this.save(function(err, amount) {
         if (err) callback(err)
         else callback(null, amount)
      })
}

/*
Based on profile information retrieved by pasportjs (when using facebook or google login) we will search for user in database,
if not found we will create the user and return in the callback
*/
userSchema.statics.findOrCreateOAuthUser = function (profile, callback) {
    var user = new this(); // Creates instance of the model
    var User = mongoose.model('User');

    //Checking for user if login is trough facebook
    if (profile.provider == 'facebook') {
        console.log(profile.id);
        console.log(User.findOne); // [Function: findOne]
        User.findOne({fbId : profile.id}, function (err, usr) {
            console.log("Entering FindOne")
            if (err) {
                console.log("Error Searching")
                callback(err, null);
            } else if (usr != null) {
                console.log("User Found: " + usr)
                // User found and returned
                callback(null, usr)
            } else {
                console.log("Creating User")
                // User not found so we create it
                user.fbId = profile.id;
                user.username = profile.displayName;
                user.firstname = profile.name.givenName;
                user.lastname = profile.name.familyName;
                user.save(function (err, user, amount) {
                    if (err) {
                        callback(err)
                    } else {
                        console.log("Created new User")
                        callback(null, user)
                    }
                })
            }
        })
    }
    // check if login trough google oath
    if (profile.provider == 'google') {
      User.findOne({gId: profile.id}, function(err, usr) {
         if (err) {
            callback(err, null)
         } else if (usr != null) {
            callback(null, usr)
         } else {
            user.gId = profile.id
            user.firstname = profile.name.givenName;
            user.lastname = profile.name.familyName;
            user.save(function(err, user, amount) {
               if (err) {callback(err)}
               else {
                  callback(null, user)
               }
            })
         }
      })
   }
}


module.exports = mongoose.model('User', userSchema);
