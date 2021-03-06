'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
// this is the getKey function that generates an encryption Key for you by passing your Secret Key as a parameter.
function getKey(seckey) {
  var md5 = require('md5');
  var keymd5 = md5(seckey);
  var keymd5last12 = keymd5.substr(-12);

  var seckeyadjusted = seckey.replace('FLWSECK-', '');
  var seckeyadjustedfirst12 = seckeyadjusted.substr(0, 12);

  return seckeyadjustedfirst12 + keymd5last12;
}

// This is the encryption function that encrypts your payload by passing the stringified format and your encryption Key.
function encrypt(key, text) {
  var CryptoJS = require('crypto-js');
  var forge = require('node-forge');
  var utf8 = require('utf8');
  var cipher = forge.cipher.createCipher('3DES-ECB', forge.util.createBuffer(key));
  cipher.start({ iv: '' });
  cipher.update(forge.util.createBuffer(text, 'utf-8'));
  cipher.finish();
  var encrypted = cipher.output;
  return forge.util.encode64(encrypted.getBytes());
}

/**** THIS ENCRYPTION SECTION IS FOR FRONT END ECRYPTION***/

// Encryption can also be done at the front end using `RSA Encryption`:

function getPublicKey() {
  // write function to generate Public Key here using RSA Encryption
  // see cryptico docs on how to do that.
}

exports.default = {
  getKey: getKey,
  getPublicKey: getPublicKey,
  encrypt: encrypt
};
//# sourceMappingURL=index.js.map