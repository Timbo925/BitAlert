var express = require('express');
var router = express.Router();
var passport = require('passport');
var Address = require('../models/address')
var Account = require('../models/account')
var rf = require('../models/router_functions')

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/dashboard', rf.isAuthenticatedSite ,function(req, res) {
  Address.find({user: req.user.id})
    .populate('source', 'label')
    .exec(function(err, data) {
      if (err) {res.json(500, err)}
      var balanceSat = 0;
      for(var i = 0; i<data.length; i++) {
        balanceSat += data[i].balanceSat;
      }
      res.render('dashboard', { title: 'BitAlert Dashbaord',
                                data: {
                                  list: data,
                                  balanceSat: balanceSat}});
    })
});

router.get('/manage', rf.isAuthenticatedSite ,function(req, res) {
  Account
  .find({user: req.user.id})
  .populate('sources')
  .exec(function(err, list) {
    if (err) {res.render('error')}
    res.render('manage', {
      title: 'BitAlert Managing Page',
      accounts: list
    })
  })

});

router.post('/login', passport.authenticate('local'),
  function(req,res) {
    res.redirect('dashboard')
  })

router.get('/login', function(rq,res) {
  res.render('login')
})

module.exports = router;
