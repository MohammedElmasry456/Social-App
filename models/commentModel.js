const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Title Required"] },
    desc: { type: String, required: [true, "Description Required"] },
    img: { type: String },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: [true, "Post Id Required"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User Id Required"],
    },
  },
  { timestamps: true }
);

const commentModel = mongoose.model("Comment", commentSchema);
module.exports = commentModel;
