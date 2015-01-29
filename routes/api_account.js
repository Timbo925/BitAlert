var express = require('express');
var router = express.Router();
var passport = require('passport');
var Account = require('../models/account')
//ROOT= api/account

//Create new account
router.post('/', function(req, res) {
   if (!req.isAuthenticated()) {res.json(401, {status: 'error', message: 'Not Authenticated'})}
   //if (!req.body.label) {return res.json(500, {status:'error', message: 'no xpub given in body'})}
   var acc = new Account();
   if (acc.label) {acc.label = req.body.label}
   acc.user = req.user.id
   acc.save(function(err) {
     if (err) {res.json(500,err)}
     res.json(200,acc)
   })
})


module.exports = router
