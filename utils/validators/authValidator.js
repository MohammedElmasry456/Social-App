const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const userModel = require("../../models/userModel");

exports.registerValidator = [
  check("userName")
    .notEmpty()
    .withMessage("userName is required")
    .isLength({ min: 3 })
    .withMessage("Too Short User Name")
    .custom((val) =>
      userModel.findOne({ userName: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("userName is Already Exist"));
        }
      })
    ),
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid Email")
    .custom((val) =>
      userModel.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("Email is Already Exist"));
        }
      })
    ),
  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("min length of password equal 8"),
  // .custom((val) => {
  //   const regex =
  //     /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&])[A-Za-z\d@.#$!%*?&]/;
  //   if (!regex.test(val)) {
  //     throw new Error("Invalid Password");
  //   }
  //   return true;
  // })
  validatorMiddleware,
];

exports.loginValidator = [
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid Email"),
  check("password").notEmpty().withMessage("Password is required"),
  validatorMiddleware,
];
