const asyncHandler = require("express-async-handler");
const postModel = require("../models/postModel");
const {
  createOne,
  updateOne,
  getOne,
  getAll,
  deleteOne,
} = require("./refHandler");
const ApiError = require("../utils/apiError");
const userModel = require("../models/userModel");
const upload = require("../middlewares/multerMiddleware");
const cloudinary = require("../utils/cloudinary");

exports.uploadImage = upload.single("img");
exports.resizeUploadedImage = async (req, res, next) => {
  if (req.file) {
    const options = {
      folder: "uploads",
      quality: "auto",
      fetch_format: "auto",
    };

    if (req.file.mimetype.startsWith("image")) {
      options.transformation = {
        width: 400,
        height: 400,
        gravity: "faces",
        crop: "fill",
      };
    } else {
      options.resource_type = "video";
    }
    await cloudinary.uploader
      .upload(req.file.path, options)
      .then((result) => {
        req.body.img = result.url;
      })
      .catch((e) => console.log(e));
  }
  next();
};

// set User Id
exports.setUserId = async (req, res, next) => {
  req.body.userId = req.body.userId ? req.body.userId : req.user._id;
  next();
};

//create post
exports.createPost = createOne(postModel);

//update post
exports.updatePost = updateOne(postModel);

//get post
exports.getPost = getOne(postModel);

//get posts
exports.getPosts = getAll(postModel);

//delete post
exports.deletePost = deleteOne(postModel);

//Like And Dislike post
exports.likeAndDislike = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  let post = await postModel.findById(req.params.id);
  if (!post) {
    return next(new ApiError("post Not Found", 404));
  }

  if (!post.likes.includes(userId)) {
    post = await postModel.findByIdAndUpdate(
      req.params.id,
      { $push: { likes: userId } },
      { new: true }
    );
  } else {
    post = await postModel.findByIdAndUpdate(
      req.params.id,
      { $pull: { likes: userId } },
      { new: true }
    );
  }

  res.status(200).send({
    message: "post like or dislike action completed Successfully",
    data: post,
  });
});

//get TimeLine Posts
exports.getTimeLinePosts = asyncHandler(async (req, res, next) => {
  const currentUser = await userModel.findById(req.body.userId);
  if (!currentUser) {
    return next(new ApiError("User Not Found", 404));
  }

  let posts = await Promise.all(
    currentUser.followings.map(
      async (user) => await postModel.find({ userId: user })
    )
  );
  posts = [].concat(...posts);
  res.status(200).send({
    message: "posts Fetched Successfully",
    numOfPosts: posts.length,
    data: posts,
  });
});
