const asyncHandler = require("express-async-handler");
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
const groupModel = require("../models/groupModel");

//Upload Image And Resize It
exports.uploadImage = upload.fields([
  { name: "groupPic", maxCount: 1 },
  { name: "coverPic", maxCount: 1 },
]);
exports.resizeUploadedImage = async (req, res, next) => {
  if (req.files) {
    if (req.files.groupPic) {
      await cloudinary.uploader
        .upload(req.files.groupPic[0].path, {
          folder: "Social-App/Groups/groupPic",
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
          req.body.groupPic = result.url;
        });
    }
    if (req.files.coverPic) {
      await cloudinary.uploader
        .upload(req.files.coverPic[0].path, {
          folder: "Social-App/Groups/coverPic",
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

exports.setAdmintoGroup = async (req, res, next) => {
  req.body.admins = req.user._id;
  req.body.followers = req.user._id;
  next();
};

exports.areYouAdmin = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const group = await groupModel.findById(req.params.id);
  if (!group.admins.includes(userId) && !req.user.isAdmin) {
    return next(new ApiError("You Don't Allowed To Do This Process", 400));
  }
  next();
});

//create Group
exports.createGroup = createOne(groupModel);

//update Group
exports.updateGroup = updateOne(groupModel);

//get Group
exports.getGroup = getOne(groupModel);

//get Groups
exports.getGroups = getAll(groupModel);

//delete refrences to the group
exports.deleteReference = asyncHandler(async (req, res, next) => {
  const group = await groupModel.findById(req.params.id);
  if (!group) {
    return next(new ApiError("Group Not Found", 404));
  }
  await Promise.all(
    group.followers.map(async (follower) => {
      await groupModel.findByIdAndUpdate(follower, {
        $pull: { myGroups: req.params.id },
      });
    })
  );
  next();
});

//delete Group
exports.deleteGroup = deleteOne(groupModel);

//add Admin To Group
exports.addAdminToGroup = asyncHandler(async (req, res, next) => {
  let group = await groupModel.findById(req.params.id);
  const user = await userModel.findById(req.body.userId);
  if (!group) {
    return next(new ApiError("The Group Not Found", 404));
  }
  if (!user) {
    return next(new ApiError("The User Not Found", 404));
  }

  if (group.admins.includes(req.body.userId)) {
    return next(new ApiError("The User Already Is Admin", 400));
  }

  group = await groupModel.findByIdAndUpdate(
    req.params.id,
    {
      $push: { admins: req.body.userId },
    },
    { new: true }
  );

  res
    .status(200)
    .send({ message: "The User Added To Admin Successfully", data: group });
});

//remove user from admins
exports.removeUserFromAdmins = asyncHandler(async (req, res, next) => {
  let group = await groupModel.findById(req.params.id);
  const user = await userModel.findById(req.body.userId);
  if (!group) {
    return next(new ApiError("The Group Not Found", 404));
  }
  if (!user) {
    return next(new ApiError("The User Not Found", 404));
  }

  if (!group.admins.includes(req.body.userId)) {
    return next(new ApiError("The User Already Don't Belong To Admins", 400));
  }

  group = await groupModel.findByIdAndUpdate(
    req.params.id,
    {
      $pull: { admins: req.body.userId },
    },
    { new: true }
  );

  res.status(200).send({
    message: "The User Removed From Admins Successfully",
    data: group,
  });
});
