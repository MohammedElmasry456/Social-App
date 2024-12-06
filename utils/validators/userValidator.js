const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const userModel = require("../../models/userModel");
const groupModel = require("../../models/groupModel");

exports.updateUserValidator = [
  check("userName")
    .optional()
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
    .optional()
    .isEmail()
    .withMessage("Invalid Email")
    .custom((val) =>
      userModel.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("Email is Already Exist"));
        }
      })
    ),
  validatorMiddleware,
];

exports.updatePasswordValidator = [
  check("password")
    .optional()
    .isLength({ min: 8 })
    .withMessage("minimum length equal 8"),
  validatorMiddleware,
];
exports.getUserValidator = [
  check("id")
    .notEmpty()
    .withMessage("Id is required")
    .isMongoId()
    .withMessage("Invalid Id"),
  validatorMiddleware,
];
exports.deleteUserValidator = [
  check("id")
    .notEmpty()
    .withMessage("Id is required")
    .isMongoId()
    .withMessage("Invalid Id"),
  validatorMiddleware,
];

exports.followUserValidator = [
  check("id").optional().isMongoId().withMessage("Invalid Id"),
  check("userId")
    .notEmpty()
    .withMessage("userId is required")
    .isMongoId()
    .withMessage("Invalid userId")
    .custom(
      async (val, { req }) =>
        await userModel.findById(val).then((user) => {
          if (user) {
            if (val === req.user._id.toString()) {
              return Promise.reject(new Error("You Can't Follow Yourself"));
            }
            if (user.followers.includes(req.user._id)) {
              return Promise.reject(new Error("You Already Follow This User"));
            }
          }
        })
    ),
  validatorMiddleware,
];

exports.unfollowUserValidator = [
  check("id").optional().isMongoId().withMessage("Invalid Id"),
  check("userId")
    .notEmpty()
    .withMessage("userId is required")
    .isMongoId()
    .withMessage("Invalid userId")
    .custom(
      async (val, { req }) =>
        await userModel.findById(val).then((user) => {
          if (user) {
            if (val === req.user._id.toString()) {
              return Promise.reject(new Error("You Can't unFollow Yourself"));
            }
            if (!user.followers.includes(req.user._id)) {
              return Promise.reject(
                new Error("You Already don't Follow This User")
              );
            }
          }
        })
    ),
  validatorMiddleware,
];

exports.followGroupValidator = [
  check("id").optional().isMongoId().withMessage("Invalid Id"),
  check("groupId")
    .notEmpty()
    .withMessage("groupId is required")
    .isMongoId()
    .withMessage("Invalid groupId")
    .custom(
      async (val, { req }) =>
        await groupModel.findById(val).then((group) => {
          if (group) {
            if (group.followers.includes(req.user._id)) {
              return Promise.reject(new Error("You Already Follow This Group"));
            }
          }
        })
    ),
  validatorMiddleware,
];

exports.unfollowGroupValidator = [
  check("id").optional().isMongoId().withMessage("Invalid Id"),
  check("groupId")
    .notEmpty()
    .withMessage("groupId is required")
    .isMongoId()
    .withMessage("Invalid groupId")
    .custom(
      async (val, { req }) =>
        await groupModel.findById(val).then((group) => {
          if (group) {
            if (!group.followers.includes(req.user._id)) {
              return Promise.reject(
                new Error("You Already unFollow This Group")
              );
            }
          }
        })
    ),
  validatorMiddleware,
];
