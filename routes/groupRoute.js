const express = require("express");
const { protect, allowedToAdmin } = require("../controllers/authController");
const postRoute = require("./postRoute");
const {
  getGroups,
  setAdmintoGroup,
  createGroup,
  getGroup,
  updateGroup,
  deleteGroup,
  areYouAdmin,
  uploadImage,
  resizeUploadedImage,
  addAdminToGroup,
  removeUserFromAdmins,
  deleteReference,
} = require("../controllers/groupController");

const router = express.Router();
router.use("/:groupId/posts", postRoute);

router
  .route("/")
  .get(getGroups)
  .post(
    protect,
    allowedToAdmin(false),
    uploadImage,
    resizeUploadedImage,
    setAdmintoGroup,
    createGroup
  );

router.put(
  "/addAdmin/:id",
  protect,
  allowedToAdmin(false),
  areYouAdmin,
  addAdminToGroup
);
router.put(
  "/removeAdmin/:id",
  protect,
  allowedToAdmin(false),
  areYouAdmin,
  removeUserFromAdmins
);

router
  .route("/:id")
  .get(getGroup)
  .put(
    protect,
    allowedToAdmin(false),
    areYouAdmin,
    uploadImage,
    resizeUploadedImage,
    updateGroup
  )
  .delete(protect, areYouAdmin, deleteReference, deleteGroup);

module.exports = router;
