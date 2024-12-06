const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    groupPic: {
      type: String,
      default: "",
    },
    coverPic: {
      type: String,
      default: "",
    },
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    desc: String,
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    id: false,
  }
);

const groupModel = mongoose.model("Group", groupSchema);
module.exports = groupModel;
