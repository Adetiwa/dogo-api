module.exports = (err, req, res, next) => {
  if(err.name == "UnauthorizedError") {
     res.status(401).json({status: false, msg: "Invalid Token", status_msg: "INVALID_TOKEN"})
  } else {
    next(err)
  }
}
