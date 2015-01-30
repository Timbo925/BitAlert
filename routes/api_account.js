var express = require('express');
var router = express.Router();
var passport = require('passport');
var Account = require('../models/account')
var Source = require('../models/source')
var help = require('../models/router_functions')
var async = require('async')

//ROOT= api/account

//Create new account
router.post('/', help.isAuthenticatedApi, function(req, res) {
   var acc = new Account();
   if (acc.label) {acc.label = req.body.label}
   acc.user = req.user.id
   acc.save(function(err) {
     if (err) {res.json(500,err)}
     res.json(200,acc)
   })
})

router.get('/all', help.isAuthenticatedApi, function(req, res) {
  Account
  .find({user: req.user.id})
  .populate('sources')
  .exec(function(err, list) {
    if (err) {res.json(500,err)}
    res.json(200, list)
  })
})



module.exports = router
