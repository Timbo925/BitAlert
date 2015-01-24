var mongoose = require('mongoose')
  , LocalStrategy = require('passport-local').Strategy
  , User = require('../models/user.js');

module.exports = function (passport, config) {

    // Session stores id on user pc for later autentication
	passport.serializeUser(function(user, done) {
		done(null, user.id); //Default id is used of mongodb ObjectId
	});

    // Retreiving user from id stored in browser
	passport.deserializeUser(function(id, done) {
		User.findOne({ _id: id }, function (err, user) {
			done(err, user);
		});
	});

   // Local strategy used for standard autentication
  	passport.use(new LocalStrategy({
		usernameField: 'username',
		passwordField: 'password'
    },
    function(username, password, done) {
        console.log(username, password)
        User.findOne({'username': username}, function (err, user) {
            console.log("User Found: " + user)
            if (err) {return done(err);}
            if (!user) {return done(null, false, {message: "Incorrect username."})}
            if (password != user.password) {return done(null, false, {message: 'Incorrect password'})}
            return done(null, user);
        })
    }))
}
