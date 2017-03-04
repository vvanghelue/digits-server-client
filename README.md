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
	countryCode: 'FR'
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

### Voice Call
**Important:** First of all you need to get token via sendVerificationCode and save it somewhere, because you can't get token from this method.
Headers are required for language detection for call.

```js
digits.voiceCall({
	phoneNumber: '0648446907',
	countryCode: 'FR',
	headers: {"user-agent": "...", "accept-language": "..."}
}).then(function(results) {
	// Makes voicecall, results contains some data
	
	// { phone_number: '...',
	// config: { tos_update: false, voice_enabled: true, email_enabled: true },
	// login_verification_user_id: '...',
	// login_verification_request_url: '...',
	// login_verification_request_type: 10,
	// login_verification_request_cause: 3,
	// login_verification_request_id: '...' }

	console.log(results);
}).then(null, function (error) {
	//error
});
```