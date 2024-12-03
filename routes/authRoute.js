const express = require("express");
const {
  register,
  login,
  forgetPassword,
  verifyResetCode,
  changePassword,
} = require("../controllers/authController");
const {
  registerValidator,
  loginValidator,
} = require("../utils/validators/authValidator");

const router = express.Router();

router.post("/register", registerValidator, register);
router.post("/login", loginValidator, login);
router.post("/forgetPassword", forgetPassword);
router.post("/verifyResetCode", verifyResetCode);
router.put("/changePassword", changePassword);

module.exports = router;
