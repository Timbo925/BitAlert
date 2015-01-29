var express = require('express');
var router = express.Router();
var passport = require('passport');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/dashboard', function(req, res) {
  //TODO CHECK autentication

  Address.Base.getAllBalance(req.user, function(err,data) {
     if (err) {return res.render('error', {error: err})}
     res.render('dashboard', { title: 'BitAlert Dashbaord',
                               data: data});
  })
});

router.get('/manage', function(req, res) {
  //TODO CHECK autentication

  Address.Single.getAllBalance(req.user, function(err,data) {
     if (err) {return res.render('error', {error: err})}
     Xpub.getUserXpub(req.user,function(err, xpubList) {
       res.render('single_address', { title: 'BitAlert Dashbaord',
                                 data:
                                  {addrSingles:data.addr,
                                   xpubList:xpubList}});
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
