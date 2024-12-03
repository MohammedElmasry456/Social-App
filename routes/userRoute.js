const express = require("express");
const commentRoute = require("./commentRoute");
const {
  updateUser,
  updatePassword,
  deleteUser,
  getUser,
  followUser,
  unfollowUser,
  uploadImage,
  resizeUploadedImage,
  getAllUsers,
  getMe,
  updateMe,
  ChangeMyPassword,
  deleteMyAccount,
} = require("../controllers/userController");
const {
  updatePasswordValidator,
  updateUserValidator,
  getUserValidator,
  deleteUserValidator,
  followUserValidator,
  unfollowUserValidator,
} = require("../utils/validators/userValidator");
const { protect, allowedTo } = require("../controllers/authController");

const router = express.Router();

router.get("/", getAllUsers);
router.use("/:userId/comments", commentRoute);

router.use(protect); // Authentication Layer

//loggedUser
router.get("/getMe", getMe, getUser);
router.put(
  "/updateMe",
  uploadImage,
  resizeUploadedImage,
  updateUserValidator,
  updateMe
);
router.put("/ChangeMyPassword", updatePasswordValidator, ChangeMyPassword);
router.put("/follow", allowedTo(false), followUserValidator, followUser);
router.put("/unfollow", allowedTo(false), unfollowUserValidator, unfollowUser);
router.delete("/deleteMyAccount", getMe, deleteMyAccount);

//other
router
  .route("/:id")
  .get(getUserValidator, getUser)
  .put(
    allowedTo(true),
    uploadImage,
    resizeUploadedImage,
    updateUserValidator,
    updateUser
  )
  .delete(allowedTo(true), deleteUserValidator, deleteUser);

router.put(
  "/:id/password",
  allowedTo(true),
  updatePasswordValidator,
  updatePassword
);

module.exports = router;
