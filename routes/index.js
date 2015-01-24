var express = require('express');
var router = express.Router();
var Address = require('../models/address')

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/dashboard', function(req, res) {
  //TODO CHECK autentication

  Address.find({user:req.user.id}, function(err,addrList) {
     if (err) {return res.render('error', {error: err})}
     var balance = 0;
     var txApperances = 0
     for (var i = 0; i < addrList.length; i++) {
        balance = balance + addrList[i].balanceSat
        txApperances += addrList[i].txApperances
     }
     res.render('dashboard', { title: 'BitAlert Dashbaord',
                               data:
                                {balance:balance,
                                 txApperances: txApperances,
                                 addr: addrList}});
  })
});

module.exports = router;
