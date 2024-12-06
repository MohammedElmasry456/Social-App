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
  followGroup,
  unfollowGroup,
  deleteReference,
} = require("../controllers/userController");
const {
  updatePasswordValidator,
  updateUserValidator,
  getUserValidator,
  deleteUserValidator,
  followUserValidator,
  unfollowUserValidator,
  followGroupValidator,
  unfollowGroupValidator,
} = require("../utils/validators/userValidator");
const { protect, allowedToAdmin } = require("../controllers/authController");

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
router.put("/follow", allowedToAdmin(false), followUserValidator, followUser);
router.put(
  "/unfollow",
  allowedToAdmin(false),
  unfollowUserValidator,
  unfollowUser
);
router.put(
  "/followGroup",
  allowedToAdmin(false),
  followGroupValidator,
  followGroup
);
router.put(
  "/unfollowGroup",
  allowedToAdmin(false),
  unfollowGroupValidator,
  unfollowGroup
);
router.delete("/deleteMyAccount", getMe, deleteReference, deleteMyAccount);

//other
router
  .route("/:id")
  .get(getUserValidator, getUser)
  .put(
    allowedToAdmin(true),
    uploadImage,
    resizeUploadedImage,
    updateUserValidator,
    updateUser
  )
  .delete(
    allowedToAdmin(true),
    deleteUserValidator,
    deleteReference,
    deleteUser
  );

router.put(
  "/:id/password",
  allowedToAdmin(true),
  updatePasswordValidator,
  updatePassword
);

module.exports = router;
