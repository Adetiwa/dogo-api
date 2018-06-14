'use strict';

module.exports = {
  // database: process.env.NODE_ENV === 'production' ? process.env.MONGOLAB_SILVER_URI : 'mongodb://root:Maintain1@ds161539.mlab.com:61539/frontdoor',
  database: 'mongodb://root:Maintain1@ds029804.mlab.com:29804/dogo',
  secret: process.env.NODE_ENV === 'production' ? 'jrfjffjrujrhff-fhf-beebvevberfebfref-bffrff-fbgbgbfgbfgb4gb4gbgbfgbfb4gbfg4bgbg4fgb' : process.env.SECRET,
  port: process.env.NODE_ENV == 'production' ? process.env.PORT : 3000,
  url: process.env.NODE_ENV === 'production' ? 'http://localhost:3000/api/' : process.env.URL,
  bodyLimit: process.env.NODE_ENV === 'production' ? "100kb" : process.env.bodyLimit,
  paystack_token: "sk_test_e4c07afa4f2abc0425166fc38e66d68c61398026",
  user_token: "AAAA9bVozUw:APA91bHmW2hLeiczcKMQcQCwkiRc2PiJnbYI2loaXL2CVaEVPpiLGTxEUjYGkmmzXH9RNOM7zdaxJea4GyJFUqW3XOOnwjXH8S-YXyTDt4ZySZsN9WOcbeSUEIZiwzeKSGeyqvFX-fK6",
  driver_token: "AAAAsDO8u0E:APA91bFaQKMD3CqyzNMSNZT8LKy7wMb6ulqKySojwu03rX0-fZ9AW_nT8HS_KkT9IB20ZC0yemvlS0A9DwHd0EEJxiKLSQFK0XG_JEjjHnezEVC1FrTLqgmO0vpDHgZGZk4kEt64PTZt"
};
//# sourceMappingURL=secret.js.map