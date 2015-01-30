var express = require('express');
var router = express.Router();
var passport = require('passport');
var Account = require('../models/account')
var Source = require('../models/source')
var help = require('../models/router_functions')
//ROOT= api/source


////////////////
//// SINGLE ////
////////////////

//Create new account
router.post('/single', help.isAuthenticatedApi
  ,help.hasValuesBody(["label", "account", "address"])
  ,function(req, res) {
  var single = new Source.Single();
  single.address = req.body.address
  single.label = req.body.label
  single.account = req.body.account
  single.user = req.user.id;
  single.ini(req.user, function(err) {
    if(err) {res.json(500, err)}
    res.json(200, single)
  })
})

//Get all Sources
router.get('/', help.isAuthenticatedApi, getSource(Source.Base))
router.get('/single', help.isAuthenticatedApi, getSource(Source.Single))
router.get('/xpub', help.isAuthenticatedApi, getSource(Source.Xpub))
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

////////////////
///// XPUB /////
////////////////

router.post('/xpub', help.isAuthenticatedApi,
  help.hasValuesBody(["label", "xpubString", "account"]),
  function(req, res) {
    var xpub = new Source.Xpub()
    xpub.xpubString = req.body.xpubString;
    xpub.account = req.body.account;
    xpub.label = req.body.label;
    xpub.user = req.user.id;
    xpub.ini(req.user, function(err) {
      if (err) {return res.json(500,err)} //TODO remove all possible addresses linked to source
      res.json(200, xpub)
    })
})

module.exports = router
