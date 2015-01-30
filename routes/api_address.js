var express = require('express');
var router = express.Router();
var passport = require('passport');
var Address = require('../models/address')
var help = require('../models/router_functions')


//Return all addresses belonging to the user
router.get('/', help.isAuthenticatedApi ,function(req,res) {
  Address.find({user: req.user.id})
    .populate('source' ,'label')
    .exec(function(err, list) {
      if (err) {res.json(500, err)}
      res.json(200,list)
    })
})


module.exports = router;
