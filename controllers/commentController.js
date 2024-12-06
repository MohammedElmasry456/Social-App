const commentModel = require("../models/commentModel");
const {
  createOne,
  updateOne,
  getOne,
  getAll,
  deleteOne,
} = require("./refHandler");

exports.setQuery = async (req, res, next) => {
  let queryFilter;
  if (req.params.postId) {
    queryFilter = { postId: req.params.postId };
  } else if (req.params.userId) {
    queryFilter = { userId: req.params.userId };
  } else {
    queryFilter = {};
  }
  req.filter_ = queryFilter;
  next();
};

exports.setPostIdAndUserId = async (req, res, next) => {
  req.body.postId = req.body.postId ? req.body.postId : req.params.postId;
  req.body.userId = req.params.userId ? req.params.userId : req.user._id;
  next();
};

//create Comment
exports.createComment = createOne(commentModel);

//update Comment
exports.updateComment = updateOne(commentModel);

//get Comment
exports.getComment = getOne(commentModel);

//get Comments
exports.getComments = getAll(commentModel);

//delete Comment
exports.deleteComment = deleteOne(commentModel);
