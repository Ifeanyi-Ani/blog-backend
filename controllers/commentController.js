const Comment = require("../models/Comment");
const User = require("../models/User");
const catchAsync = require("../utils/catchAsync");
const AppErr = require("../utils/appErr");

exports.createComment = catchAsync(async (req, res, next) => {
  const { postId } = req.params;
  const { text, userId } = req.body;

  // Check if the user exists
  const user = await User.findById(userId);
  if (!user) {
    return next(new AppErr("No user found with that ID", 404));
  }

  const comment = await Comment.create({
    text,
    postId,
    userId,
  });

  res.status(201).json(comment);
});

exports.getComments = catchAsync(async (req, res, next) => {
  const { postId } = req.params;

  const comments = await Comment.find({ postId });

  res.status(200).json(comments);
});
exports.getAllComments = catchAsync(async (req, res, next) => {
  const comments = await Comment.find();
  res.status(200).json(comments);
});
exports.editComment = catchAsync(async (req, res, next) => {
  const { commentId } = req.params;
  const { text } = req.body;

  if (!text) {
    return next(new AppErr("Comment text is required.", 400));
  }

  const comment = await Comment.findByIdAndUpdate(
    commentId,
    { text },
    { new: true, runValidators: true },
  );

  if (!comment) {
    return next(new AppErr("No comment found with that ID", 404));
  }

  res.status(200).json(comment);
});

exports.deleteComment = catchAsync(async (req, res, next) => {
  const { commentId } = req.params;

  const comment = await Comment.findByIdAndDelete(commentId);

  if (!comment) {
    return next(new AppErr("No comment found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
  });
});
