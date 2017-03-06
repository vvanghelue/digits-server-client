'use strict';


var digitsClient = require('./index');
//var digitsClient = require('digits-server-client');

var digits = new digitsClient({
  digitsConsumerKey: 'myConsumerKey',
  digitsHost: "https://mydomain.com"
});

digits.sendVerificationCode({
  phoneNumber: '0648446907',
  countryCode: 'FR',
  headers: req.headers, // for express.js
  // method: "voicecall"
}).then(function (registrationToken) {
  //eyJsb2dpblZlcmlmaWNhdGlvblJlcXVlc3RJZCI6InV...
  console.log(registrationToken);
}).then(null, function (error) {
  //error
});


digits.verifyCode({
  registrationToken: 'eyJsb2dpblZlcmlmaWNhdGlvblJlcXVlc3RJZCI6InV...',
  code: '196099',
}).then(function (results) {
  //{ success: true, phone: '+33648446907'}
  //{ success: false, phone: '+33648446907', errors: []}
  console.log(results);
}).then(null, function (error) {
  //error
});