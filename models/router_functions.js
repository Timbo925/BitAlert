var request = require('request');

exports.isAuthenticatedApi = function(req, res, next) {
  if(!req.isAuthenticated()) {res.json(401, "Not Autehnticated")}
  else {
    next();
  }
}

exports.isAuthenticatedSite = function(req, res, next) {
  if(!req.isAuthenticated()) {res.redirect('/login')}
  else {
    next();
  }
}

exports.hasValuesBody = function(list) {
  return function(req,res,next) {
    for(var i=0; i < list.length; i++) {
      if (!req.body[list[i]]) {
        res.json(500, 'Some parameters not filled in: ' + list)
        }
    }
    next();
  }
}

exports.getAddresses = function(list, confirmations, callback) {
  var url = "http://btc.blockr.io/api/v1/address/info/"
  for(var i = 0; i<list.length; i++) {
    url += list[i]
    url += ","
  }
  url = url.substring(0,url.length - 1)
  url +="?confirmations="
  url += confirmations
  console.log('Fetching Address(es): ' + list)
  request(url,
    function(err, res, body) {
      if (!err && res.statusCode == 200) {
        var json = JSON.parse(body);
        console.log(json)
        callback(null, json)
      } else {
        callback(err)
      }
    })
}
