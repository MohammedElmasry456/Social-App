const ApiError = require("../utils/apiError");

const glopalError = (error, req, res, next) => {
  error.status = error.status || "error";
  error.statusCode = error.statusCode || 500;

  if (process.env.MODE === "DEV") {
    devMode(error, res);
  } else {
    if (error.name === "TokenExpiredError")
      error = new ApiError("Expired Token, Please Login Again", 401);
    if (error.name === "JsonWebTokenError")
      error = new ApiError("Invalid Token, Please Login Again", 401);
    prodMode(error, res);
  }
};

const devMode = (error, res) => {
  res.status(error.statusCode).send({
    Status: error.status,
    Error: error,
    Message: error.message,
    Stack: error.stack,
  });
};
const prodMode = (error, res) => {
  res.status(error.statusCode).send({
    Status: error.status,
    Message: error.message,
  });
};
module.exports = glopalError;
