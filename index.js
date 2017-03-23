'use strict';

var request = require('request');

module.exports = function (options) {

  var digits_consumer_key = options.digitsConsumerKey;
  var digits_host         = options.digitsHost;

  /**
   * GET a web session needed for each api call
   */
  var getWebSession = function () {
    return new Promise(function (resolve, reject) {
      request.get({
          url: 'https://www.digits.com/embed?consumer_key=' + digits_consumer_key + '&host=' + digits_host
        },
        function (error, response, body) {
          if (error) {
            return reject('HTTP ERROR : Unable to parse Digits cookie response.');
          }
          try {
            //get session token & parse html for the authenticity_token
            var cookie            = response.headers['set-cookie'][1].split(';')[0];
            var authenticityToken = body.split('name="authenticity_token" value="')[1].slice(0,40);
          } catch (error) {
            return reject('Unable to parse Digits cookies or authenticityToken in html.');
          }

          resolve({
            cookie            : cookie,
            authenticityToken : authenticityToken
          });
        }
      )
    })
  };

  /**
    Send verification code to device via sms or voicecall
    Get registration token to challenge the code later

      Usage example :

    sendVerificationCode({
      phoneNumber: '0648446907',
      countryCode: 'FR',
      headers: {"user-agent": ...., "accept-language": .....},
      method: "sms" // sms or "voicecall"
    }).then(function (registrationToken) {
      console.log(registrationToken);
    }).then(null, function (error) {
      //error
    });
   */
  var sendVerificationCode = function (options) {
    options = options || {};

    return getWebSession().then(function (session) {
      return new Promise(function (resolve, reject) {
        request.post({
          har: {    
            "method": "POST",
            "url": "https://www.digits.com/sdk/login",
            "headers": [
              {
                "name": "cookie",
                "value": session.cookie
              },
              {
                "name": "referer",
                "value": "https://www.digits.com/embed?consumer_key=" + digits_consumer_key + "&host=" + digits_host
              },
              {
                "name": "accept-language",
                "value": options.headers && options.headers["accept-language"] ? options.headers["accept-language"] : 'en-US'
              },
              {
                "name": "user-agent",
                "value": options.headers && options.headers["user-agent"] ? options.headers["user-agent"] : 'Mozilla/5.0'
              },
            ],
            "postData": {
              "mimeType": "application/x-www-form-urlencoded",
              "params": [
                {
                  "name": "authenticity_token",
                  "value": session.authenticityToken
                },
                {
                  "name": "verification_type",
                  "value": options.method ? options.method : "sms"
                },
                {
                  "name": "x_auth_country_code",
                  "value": options.countryCode
                },
                {
                  "name": "x_auth_phone_number",
                  "value": options.phoneNumber
                }
              ]
            }
          }
        }, function (error, response, body) {
          if (error) {
            return reject('HTTP ERROR : Unable to parse Digits login response.');
          }

          try {
            var jsonBody = JSON.parse(body);
          } catch (error) {
            return reject('Unable to parse Digits response.');
          }

          if (jsonBody.errors) {
            return reject(jsonBody.errors);
          }

          var token = new Buffer(JSON.stringify({
            loginVerificationRequestId: jsonBody.login_verification_request_id,
            loginVerificationUserId: jsonBody.login_verification_user_id,
            phoneNumber: jsonBody.phone_number
          })).toString('base64')

          resolve(token);
        })
      })
    })
  };

  /**
    Test code validation

      Usage example :

    verify({
      registrationToken: 'abcdefdsjfbdshfsdfsdhfjbsdhfd...',
      code: '020531',
    }).then(function (results) {
      console.log(results);
    }).then(null, function (e) {
      //error
    });
   */
  var verify = function (options) {
    options = options || {};

    var token = JSON.parse(new Buffer(options.registrationToken, 'base64').toString('ascii'));
    return getWebSession().then(function (session) {
      return new Promise(function (resolve, reject) {
        request.post({
          har: {    
            "method": "POST",
            "url": "https://www.digits.com/sdk/challenge",
            "headers": [
              {
                "name": "cookie",
                "value": session.cookie
              },
              {
                "name": "referer",
                "value": "https://www.digits.com/embed/challenge?consumer_key=" + digits_consumer_key + "&host=" + digits_host
              }
            ],
            "postData": {
              "mimeType": "application/x-www-form-urlencoded",
              "params": [
                {
                  name:"authenticity_token",
                  value: session.authenticityToken
                },
                {
                  name:"remember_me",
                  value: "on"
                },
                {
                  name:"phone_number",
                  //value: "0648446907"
                  value: token.phoneNumber
                },
                {
                  name:"login_verification_user_id",
                  value: token.loginVerificationUserId
                },
                {
                  name: "login_verification_challenge_response",
                  "value": options.code
                },
                {
                  "name": "login_verification_request_id",
                  "value": token.loginVerificationRequestId
                }
              ]
            }
          }
        }, function (error, response, body) {
          if (error) {
            return reject(error);
          }

          try {
            var jsonBody = JSON.parse(body);
          } catch (error) {
            return reject('Unable to parse Digits response.');
          }

          if (jsonBody.errors) {
            resolve({success: false, phone: token.phoneNumber, errors: jsonBody.errors});
          }

          resolve({success: !!jsonBody['X-Verify-Credentials-Authorization'], phone: token.phoneNumber});
        })
      })
    })
  };

  this.sendVerificationCode = sendVerificationCode;
  this.verifyCode = verify;
}
