const asyncHandler = require("express-async-handler");
const bcryptjs = require("bcryptjs");
const upload = require("../middlewares/multerMiddleware");
const cloudinary = require("../utils/cloudinary");
const userModel = require("../models/userModel");
const ApiError = require("../utils/apiError");
const { getAll, deleteOne } = require("./refHandler");

//Upload Image And Resize It
exports.uploadImage = upload.fields([
  { name: "profilePic", maxCount: 1 },
  { name: "coverPic", maxCount: 1 },
]);
exports.resizeUploadedImage = async (req, res, next) => {
  if (req.files) {
    if (req.files.profilePic) {
      await cloudinary.uploader
        .upload(req.files.profilePic[0].path, {
          folder: "Social-App/Users/profilePic",
          transformation: [
            {
              width: 400,
              height: 400,
              gravity: "faces",
              crop: "fill",
            },
            { quality: "auto", fetch_format: "auto" },
          ],
        })
        .then((result) => {
          req.body.profilePic = result.url;
        });
    }
    if (req.files.coverPic) {
      await cloudinary.uploader
        .upload(req.files.coverPic[0].path, {
          folder: "Social-App/Users/coverPic",
          transformation: [
            {
              width: 851,
              height: 315,
              gravity: "auto",
              crop: "fill",
            },
            { quality: "auto", fetch_format: "auto" },
          ],
        })
        .then((result) => {
          req.body.coverPic = result.url;
        });
    }

    next();
  }
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
