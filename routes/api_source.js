var express = require('express');
var router = express.Router();
var passport = require('passport');
var Account = require('../models/account')
var Source = require('../models/source')

//ROOT= api/source

function isAuthenticatedApi(req, res, next) {
  if(!req.isAuthenticated()) {res.json(401, "Not Autehnticated")}
  else {
    next();
  }
}

function hasValuesBody(list) {
  return function(req,res,next) {
    for(var i=0; i < list.length; i++) {
      if (!req.body[list[i]]) {
        res.json(500, 'Some parameters not filled in: ' + list)
        }
    }
    next();
  }
}

//Create new account
router.post('/single', isAuthenticatedApi
  ,hasValuesBody(["label", "account", "address"])
  ,function(req, res) {
  var single = new Source.Single();
  single.address = req.body.address
  single.label = req.body.label
  single.account = req.body.account
  single.user = req.user.id;
  single.save(function(err) {
    if (err) {res.json(500,err)}
    single.ini(req.user, function(err) { //Generates all addresses belonging to source
      if (err) {res.json(500,err)}
      single.updateBalance(function(err) { //Updating balance of source
        if (err) {res.json(500,err)}
        res.json(200, single)
      })
    })
  })
})

function getSource(model) {
  return function(req, res, next) {
    model
      .find({user: req.user.id})
      .exec(function(err, list) {
        if (err) {res.json(500, err)}
        res.json(200, list)
      })
  }
}

//Get all Sources
router.get('/', isAuthenticatedApi, getSource(Source.Base))
router.get('/single', isAuthenticatedApi, getSource(Source.Single))
router.get('/xpub', isAuthenticatedApi, getSource(Source.Xpub))

module.exports = router
