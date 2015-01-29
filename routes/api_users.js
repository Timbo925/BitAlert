var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user')



router.post('/create', function(req, res) {
   console.log(req.body)
    if(req.body.username && req.body.password) {
        var user = new User;
        var stats = new Stats;
        user.username = req.body.username.trim();
        user.password = req.body.password;
        user.email = req.body.email;
        user.stats = stats;
        user.save(function (err) {
            if (err) {res.json(500, err)}
        })

        res.json(200, user)
    } else {
        res.json(500, "Some required fields are missing fields are missing")
    }
});

router.post('/login',
   passport.authenticate('local'),
   function(req, res) {
      res.json(200, {'message' : "User Authenticated",
                     'user': req.user})
   }
)

module.exports = router;
