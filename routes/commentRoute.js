const express = require("express");
const { protect, allowedTo } = require("../controllers/authController");
const {
  getComment,
  getComments,
  createComment,
  updateComment,
  deleteComment,
  setQuery,
  setPostIdAndUserId,
} = require("../controllers/commentController");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(setQuery, getComments)
  .post(protect, allowedTo(false), setPostIdAndUserId, createComment);

router
  .route("/:id")
  .get(getComment)
  .put(protect, allowedTo(false), updateComment)
  .delete(protect, deleteComment);

module.exports = router;
