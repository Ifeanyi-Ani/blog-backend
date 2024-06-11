const Comment = require("../models/Comment");
const User = require("../models/User");
const catchAsync = require("../utils/catchAsync");
const AppErr = require("../utils/appErr");
const Post = require("../models/Post");

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
  if (!comment) {
    return next(new AppErr("unable to create comment", 404));
  }
  await Post.findByIdAndUpdate(postId, { $push: { comments: comment._id } });
  res.status(201).json(comment);
});

exports.replyComment = catchAsync(async (req, res, next) => {
  const reply = new Comment({
    text: req.body.text,
    userId: req.body.userId,
    postId: req.params.postId,
    parentId: req.params.parentId,
  });
  const saveReply = await reply.save();
  await Comment.findByIdAndUpdate(req.params.parentId, {
    $push: { replies: saveReply._id },
  });
  if (!saveReply) {
    return new (AppErr("unable to reply", 404))();
  }
  res.status(201).json(saveReply);
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
