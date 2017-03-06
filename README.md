# What ?
Node.js alternative to https://docs.fabric.io/web/digits/getting-started.html

### Installation

```sh
$ npm install --save digits-server-client
```

### Initialization
```js
var digitsClient = require('digits-server-client');

var digits = new digitsClient({
	digitsConsumerKey: 'myConsumerKey',
	digitsHost: "https://mydomain.com" //MUST BE HTTPS
});
```


### Send code
```js
digits.sendVerificationCode({
	phoneNumber: '0648446907',
	countryCode: 'FR',
	headers: req.headers // for express.js,
	// method: "voicecall" (sms by default)
}).then(function (registrationToken) {
	//eyJsb2dpblZlcmlmaWNhdGlvblJlcXVlc3RJZCI6InV...
	console.log(registrationToken);
}).then(null, function (error) {
	//error
});
```

### Verify code
```js
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
```