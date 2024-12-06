const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const ApiFeature = require("../utils/apiFeatures");
const postModel = require("../models/postModel");
const commentModel = require("../models/commentModel");
const { deleteImage } = require("../utils/deleteImage");
const groupModel = require("../models/groupModel");
const userModel = require("../models/userModel");

//create document
exports.createOne = (model) =>
  asyncHandler(async (req, res) => {
    const document = await model.create(req.body);
    if (model === groupModel) {
      await userModel.findByIdAndUpdate(req.user._id, {
        $push: { myGroups: document._id },
      });
    }
    res
      .status(201)
      .send({ message: "document created Successfully", data: document });
  });

//update document
exports.updateOne = (model) =>
  asyncHandler(async (req, res, next) => {
    const query =
      model === postModel || model === commentModel
        ? { _id: req.params.id, userId: req.user._id }
        : { _id: req.params.id };

    const oldDoc = await model.findOne(query);
    if (!oldDoc) {
      return next(
        new ApiError("document Not Found Or Document Not Belong To You", 404)
      );
    }
    await deleteImage(oldDoc, req);

    const document = await model.findOneAndUpdate(query, req.body, {
      new: true,
    });

    res
      .status(200)
      .send({ message: "document Updated Successfully", data: document });
  });

//get document
exports.getOne = (model) =>
  asyncHandler(async (req, res, next) => {
    const document = await model.findById(req.params.id);
    if (!document) {
      return next(new ApiError("document Not Found", 404));
    }
    res
      .status(200)
      .send({ message: "document Fetched Successfully", data: document });
  });

//get documents
exports.getAll = (model) =>
  asyncHandler(async (req, res) => {
    const filters = req.filter_ ? req.filter_ : {};
    const documentsQuery = new ApiFeature(req.query, model.find(filters))
      .filter()
      .sort()
      .search()
      .limitFields();

    const count = await documentsQuery.count();
    documentsQuery.paginate(count);

    const documents = await documentsQuery.mongooseQuery;

    res.status(200).send({
      message: "documents Fetched Successfully",
      numOfDoc: documents.length,
      paginationResult: documentsQuery.paginationResult,
      data: documents,
    });
  });

//delete document
exports.deleteOne = (model) =>
  asyncHandler(async (req, res, next) => {
    let document;

    if (model === postModel || model === commentModel) {
      if (req.user.isAdmin) {
        document = await model.findOneAndDelete({ _id: req.params.id });
      } else {
        document = await model.findOneAndDelete({
          _id: req.params.id,
          userId: req.user._id,
        });
      }
    } else {
      document = await model.findByIdAndDelete(req.params.id);
    }

    if (!document) {
      return next(
        new ApiError("Document Not Found Or Is Not Belong To You", 404)
      );
    }
    await deleteImage(document, req);
    res.status(204).send();
  });
