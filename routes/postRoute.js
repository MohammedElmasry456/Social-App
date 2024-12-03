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
  setUserId,
} = require("../controllers/postController");
const { protect, allowedTo } = require("../controllers/authController");

const router = express.Router();

router.use("/:postId/comments", commentRoute);
router
  .route("/")
  .get(getPosts)
  .post(
    protect,
    allowedTo(false),
    uploadImage,
    resizeUploadedImage,
    setUserId,
    createPost
  );

router.get(
  "/getTimeLinePosts",
  protect,
  allowedTo(false),
  setUserId,
  getTimeLinePosts
);

router
  .route("/:id")
  .get(getPost)
  .put(protect, allowedTo(false), updatePost)
  .delete(protect, deletePost);

router.put("/:id/likePost", protect, allowedTo(false), likeAndDislike);

module.exports = router;
