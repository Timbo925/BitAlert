var express = require('express');
var router = express.Router();
var passport = require('passport');
var Address = require('../models/address')
var Xpub = require('../models/xpub')


//Get information from xpub address
router.post('/xpub', function(req, res) {
   if (req.body.xpub,req.body.from,req.body.to,req.body.type) {
         Xpub.getXpubBalances(req.body.xpub,parseInt(req.body.from),parseInt(req.body.to),parseInt(req.body.type),function (err, response) {
            if (err) res.json(500, {message: 'something went wrong', err: err});
            else res.json(200,response);
         })
   } else {
      res.json(500, {status: 'error', message: 'Some parameters not set'})
   }
})

router.post('/xpub/add', function(req, res) {
   if (!req.isAuthenticated()) {res.json(401, {status: 'error', message: 'Not Authenticated'})}
   if (!req.body.xpub) {return res.json(500, {status:'error', message: 'no xpub given in body'})}
   xpub = new Xpub();
   xpub.xpub = req.body.xpub;
   xpub.user = req.user;
   if(req.body.label) {xpub.label = req.body.label}
   xpub.save(function(err) {
      if (err) {return res.json(500, err)}
      xpub.fillBothUntil(req.user,function(err) {
         if(err) {return res.json(500,err)}
         return res.json(200, {status: 'success'})
      })
   })
})

router.post('/xpub/next/:xpubId', function(req, res) {
   if (!req.isAuthenticated()) {res.json(401, {status: 'error', message: 'Not Authenticated'})}
   if (!req.params.xpubId) {res.json(500, {status:'error', message: 'No Xpub id number given'})}
   Xpub.findOne({_id: req.params.xpubId}, function(err, xpub) {
      if (err || !xpub) {return res.json(500, {status: 'error', data: xpub})}
      xpub.fillBothUntil(req.user,function(err) {
         if(err) {return res.json(500,{status: 'error', message : err.toString()})}
         return res.json(200, {status: 'success'})
      })
   })
})

router.get('/', function(req,res) {
   if (!req.isAuthenticated()) {res.json(401, {status: 'error', message: 'Not Authenticated'})}
   Address.find({user:req.user.id}, function(err,addrList) {
      if (err) {return res.json(500, err)}
      var balance = 0;
      for (var i = 0; i < addrList.length; i++) {
         balance = balance + addrList[i].balanceSat
      }
      return res.json(200,{status: 'success', data: {balance: balance, addr: addrList}})
   })
})

router.get('/balance' ,function(req,res) {
   if (!req.isAuthenticated()) {res.json(401, {status: 'error', message: 'Not Authenticated'})}
   Address.getBalance(req.user, function(err, balance) {
      if(err) {return res.json(500, {status: 'error', message: "Problem getting balance"})}
      return res.json(200, {status: 'success', data: {balance: balance}})
   })
})

router.post('/', function(req,res) {
   if (!req.isAuthenticated()) {res.json(401, {status: 'error', message: 'Not Authenticated'})}
   if(req.body.addrStr) {
      var addr = new Address();
      addr.addressStr = req.body.addrStr
      addr.user = req.user.id
      if(req.body.label) {addr.label = req.body.label}
      addr.updateAddress(function(err, edited) {
         res.json(200, {message: 'success', data:{addr: addr}})
      })
   } else {
      return res.json(500,"No addrStr given")
   }
})




module.exports = router;
