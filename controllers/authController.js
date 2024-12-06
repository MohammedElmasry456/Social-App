const asyncHandler = require("express-async-handler");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { createHmac } = require("node:crypto");
const userModel = require("../models/userModel");
const ApiError = require("../utils/apiError");
const { sendMail } = require("../utils/sendMail");

//Register
exports.register = asyncHandler(async (req, res) => {
  const { userName, email, password } = req.body;
  const user = await userModel.create({ userName, email, password });
  const token = jwt.sign({ userId: user._id }, process.env.JWTSECRET, {
    expiresIn: process.env.JWTDURATION,
  });
  res
    .status(201)
    .send({ message: "User Created Successfully", data: user, token });
});

//Login
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email });
  if (!user || !(await bcryptjs.compare(password, user.password))) {
    return next(new ApiError("Error In Email Or Password", 400));
  }
  const token = jwt.sign({ userId: user._id }, process.env.JWTSECRET, {
    expiresIn: process.env.JWTDURATION,
  });
  res.status(200).send({ message: "Login Successfully", data: user, token });
});

//protect
exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token || token === "null") {
    return next(new ApiError("You Are Not Login ,Please Login Again", 401));
  }
  const decode = jwt.verify(token, process.env.JWTSECRET);

  const user = await userModel.findOne({ _id: decode.userId });
  if (!user) {
    return next(new ApiError("Token not belong to user", 401));
  }

  if (user.passwordChangedAt) {
    const date = parseInt(user.passwordChangedAt.getTime() / 1000, 10);
    if (decode.iat < date) {
      return next(new ApiError("Password Changed ,Please Login Again", 401));
    }
  }
  req.user = user;
  next();
});

//allowed to
exports.allowedToAdmin = (...options) =>
  asyncHandler(async (req, res, next) => {
    if (!options.includes(req.user.isAdmin)) {
      return next(new ApiError("You Are Not Allowed To Acces This Route", 403));
    }
    next();
  });

exports.forgetPassword = asyncHandler(async (req, res, next) => {
  const user = await userModel.findOne({ email: req.body.email });
  if (!user) {
    return next(new ApiError("Email Not Belong To User", 404));
  }
  const code = Math.floor(Math.random() * 1000000000).toString();
  const hashCode = createHmac("sha256", process.env.CRYPTOSECRET)
    .update(code)
    .digest("hex");
  try {
    await sendMail({ user: req.body.email, message: code });
    user.PasswordResetCode = hashCode;
    user.PasswordResetCodeExpire = Date.now() + 10 * 60 * 1000;
    user.PasswordResetVerified = false;
  } catch (error) {
    user.PasswordResetCode = undefined;
    user.PasswordResetCodeExpire = undefined;
    user.PasswordResetVerified = undefined;
    return next(new ApiError(error, 500));
  }

  await user.save();
  res
    .status(200)
    .send({ status: "success", message: "Reset Code Send Successfully" });
});

exports.verifyResetCode = asyncHandler(async (req, res, next) => {
  const { code } = req.body;
  const hashCode = createHmac("sha256", process.env.CRYPTOSECRET)
    .update(code)
    .digest("hex");
  const user = await userModel.findOne({
    PasswordResetCode: hashCode,
    PasswordResetCodeExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ApiError("Reset Code Invalid Or Expired", 400));
  }
  user.PasswordResetVerified = true;
  await user.save();
  res
    .status(200)
    .send({ status: "success", message: "Reset Code Verified Successfully" });
});

exports.changePassword = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email });
  if (!user) {
    return next(new ApiError("User Not Found", 404));
  }

  if (!user.PasswordResetVerified) {
    return next(new ApiError("reset code not verified", 400));
  }
  user.password = password;
  user.PasswordResetCode = undefined;
  user.PasswordResetCodeExpire = undefined;
  user.PasswordResetVerified = undefined;
  await user.save();

  const token = jwt.sign({ userId: user._id }, process.env.JWTSECRET, {
    expiresIn: process.env.JWTDURATION,
  });
  res.status(200).send({ message: "Password Changed Successfully", token });
});
