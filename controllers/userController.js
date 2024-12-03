const asyncHandler = require("express-async-handler");
const bcryptjs = require("bcryptjs");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");
const userModel = require("../models/userModel");
const ApiError = require("../utils/apiError");
const { getAll, deleteOne } = require("./refHandler");

//Upload Image And Resize It
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype.startsWith("video/")
  ) {
    cb(null, true);
  } else {
    cb(new ApiError("Image Or Video Only", 400), false);
  }
};

exports.uploadImage = multer({ storage, fileFilter }).fields([
  { name: "profilePic", maxCount: 1 },
  { name: "coverPic", maxCount: 1 },
]);
exports.resizeUploadedImage = async (req, res, next) => {
  if (req.files.profilePic) {
    const profilePicName = `profilePic-${Date.now()}${uuidv4()}.png`;
    await sharp(req.files.profilePic[0].buffer)
      .resize(400, 400)
      .jpeg({ quality: 90 })
      .toFormat("png")
      .toFile(`uploads/users/${profilePicName}`);
    req.body.profilePic = profilePicName;
  }
  if (req.files.coverPic) {
    const coverPicName = `coverPic-${Date.now()}${uuidv4()}.jpeg`;
    await sharp(req.files.coverPic[0].buffer)
      .resize(851, 315)
      .jpeg({ quality: 90 })
      .toFormat("jpeg")
      .toFile(`uploads/users/${coverPicName}`);
    req.body.coverPic = coverPicName;
  }

  next();
};

//Update User Info
exports.updateUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  // eslint-disable-next-line no-unused-vars
  const { password, ...data } = req.body;
  const user = await userModel.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    return next(new ApiError("User Not Found", 404));
  }

  res.status(200).send({ message: "User Updated Successfully", data: user });
});

//Update User Password
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { password } = req.body;
  const user = await userModel.findByIdAndUpdate(
    id,
    {
      password: await bcryptjs.hash(password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
      runValidators: true,
    }
  );
  if (!user) {
    return next(new ApiError("User Not Found", 404));
  }

  res
    .status(200)
    .send({ message: "Password Updated Successfully", data: user });
});

//Get Users
exports.getAllUsers = getAll(userModel);

//Get User
exports.getUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = await userModel
    .findById(id)
    .populate({
      path: "followers",
      select: "userName -_id",
    })
    .populate({
      path: "followings",
      select: "userName -_id",
    })
    .populate({ path: "posts" });
  if (!user) {
    return next(new ApiError("User Not Found", 404));
  }
  res
    .status(200)
    .send({ message: "User Has Been Fetched Successfully", data: user });
});

//Delete User
exports.deleteUser = deleteOne(userModel);

////////////////////////For Logged User////////////////////
//get Me
exports.getMe = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  console.log(req.params.id);
  next();
});

//updateMe
exports.updateMe = asyncHandler(async (req, res, next) => {
  const id = req.user._id;
  // eslint-disable-next-line no-unused-vars
  const { password, isAdmin, ...data } = req.body;
  const user = await userModel.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    return next(new ApiError("User Not Found", 404));
  }

  res.status(200).send({ message: "User Updated Successfully", data: user });
});

//Change My Password
exports.ChangeMyPassword = asyncHandler(async (req, res, next) => {
  const id = req.user._id;
  const { password } = req.body;
  const user = await userModel.findByIdAndUpdate(
    id,
    {
      password: await bcryptjs.hash(password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
      runValidators: true,
    }
  );
  if (!user) {
    return next(new ApiError("User Not Found", 404));
  }

  res
    .status(200)
    .send({ message: "Password Updated Successfully", data: user });
});

//follow User
exports.followUser = asyncHandler(async (req, res, next) => {
  const id = req.user._id;
  const user = await userModel.findByIdAndUpdate(req.body.userId, {
    $push: { followers: id },
  });
  if (!user) {
    return next(new ApiError("User Not Found", 404));
  }
  const currentUser = await userModel.findByIdAndUpdate(
    id,
    {
      $push: { followings: req.body.userId },
    },
    { new: true }
  );

  if (!currentUser) {
    return next(new ApiError("current user Not Found", 404));
  }
  res
    .status(200)
    .send({ message: "now, You follow this user", data: currentUser });
});

//unfollow User
exports.unfollowUser = asyncHandler(async (req, res, next) => {
  const id = req.user._id;
  const user = await userModel.findByIdAndUpdate(req.body.userId, {
    $pull: { followers: id },
  });

  if (!user) {
    return next(new ApiError("User Not Found", 404));
  }

  const currentUser = await userModel.findByIdAndUpdate(
    id,
    {
      $pull: { followings: req.body.userId },
    },
    { new: true }
  );

  if (!currentUser) {
    return next(new ApiError("current user Not Found", 404));
  }
  res
    .status(200)
    .send({ message: "now, You unfollow this user", data: currentUser });
});

//delete My Account
exports.deleteMyAccount = deleteOne(userModel);
