const Comment = require("../models/Comment");
const catchAsync = require("../utils/catchAsync");
const AppErr = require("../utils/appErr");
const factoryHandler = require("./factoryHandlers");

exports.createComment = factoryHandler.createOne(Comment);

exports.replyComment = factoryHandler.createOne(Comment);

exports.getReplies = factoryHandler.getAll(Comment);

exports.getComments = factoryHandler.getAll(Comment);

exports.editComment = factoryHandler.updateOne(Comment);

exports.deleteComment = factoryHandler.deleteOne(Comment);

exports.likeComment = factoryHandler.likeOne(Comment);
