const Comment = require("../models/Comment");
const catchAsync = require("../utils/catchAsync");
const AppErr = require("../utils/appErr");
const factoryHandler = require("./factoryHandlers");

exports.setPostIdAndUserId = (req, _res, next) => {
  req.body.postId = req.params.postId;
  req.body.userId = req.user.id;
  next();
};

exports.setParentIdAndUserId = (req, _res, next) => {
  req.body.parentId = req.params.parentId;
  req.body.userId = req.user.id;
  console.log(req.body);
  next();
};

exports.createComment = factoryHandler.createOne(Comment);

exports.replyComment = factoryHandler.createOne(Comment);

exports.getReplies = factoryHandler.getAll(Comment);

exports.getComments = factoryHandler.getAll(Comment);

exports.editComment = factoryHandler.updateOne(Comment);

exports.deleteComment = factoryHandler.deleteOne(Comment);

exports.likeComment = factoryHandler.likeOne(Comment);
