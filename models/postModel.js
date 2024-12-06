const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    desc: { type: String, required: true },
    img: [{ type: String }],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },
  },
  { timestamps: true }
);

const postModel = mongoose.model("Post", postSchema);
module.exports = postModel;
