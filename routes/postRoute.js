const express = require("express");
const commentRoute = require("./commentRoute");
const {
  getPosts,
  createPost,
  getPost,
  updatePost,
  deletePost,
  likeAndDislike,
  getTimeLinePosts,
  uploadImage,
  resizeUploadedImage,
  setQuery,
  setUserIdAndGroupId,
} = require("../controllers/postController");
const { protect, allowedToAdmin } = require("../controllers/authController");

const router = express.Router({ mergeParams: true });

router.use("/:postId/comments", commentRoute);
router
  .route("/")
  .get(setQuery, getPosts)
  .post(
    protect,
    allowedToAdmin(false),
    uploadImage,
    resizeUploadedImage,
    setUserIdAndGroupId,
    createPost
  );

router.get(
  "/getTimeLinePosts",
  protect,
  allowedToAdmin(false),
  setUserIdAndGroupId,
  getTimeLinePosts
);

router
  .route("/:id")
  .get(getPost)
  .put(
    protect,
    allowedToAdmin(false),
    uploadImage,
    resizeUploadedImage,
    updatePost
  )
  .delete(protect, deletePost);

router.put("/:id/likePost", protect, allowedToAdmin(false), likeAndDislike);

module.exports = router;
