class ApiError extends Error {
  constructor(msg, statusCode) {
    super(Error);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith(4) ? "fail" : "error";
    this.message = msg;
    this.isOperational = true;
  }
}

module.exports = ApiError;
