module.exports = {
  port: process.env.NODE_ENV == 'production' ? process.env.PORT : 3000,
  url: process.env.NODE_ENV === 'production' ? 'http://localhost:3000/api/' : process.env.URL,
  bodyLimit: process.env.NODE_ENV === 'production' ? "100kb" : process.env.bodyLimit,
}
