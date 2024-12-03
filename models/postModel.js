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
  },
  { timestamps: true }
);

const setUrl = (doc) => {
  const imgs = [];
  doc.img.map((e) => {
    imgs.push(`${process.env.URL}/posts/${e}`);
  });
  doc.img = imgs;
};

// postSchema.post("save", (doc) => {
//   setUrl(doc);
// });
// postSchema.post("init", (doc) => {
//   setUrl(doc);
// });

const postModel = mongoose.model("Post", postSchema);
module.exports = postModel;
