const Comment = require("../models/Comment");
const catchAsync = require("../utils/catchAsync");
const AppErr = require("../utils/appErr");

exports.createComment = catchAsync(async (req, res, next) => {
  const { postId } = req.params;

  const comment = await Comment.create({
    ...req.body,
    postId,
    userId: req.user.id,
    parentId: null,
  });
  if (!comment) {
    return next(new AppErr("unable to create comment", 404));
  }

  res.status(201).json(comment);
});

exports.replyComment = catchAsync(async (req, res, next) => {
  const { parentId } = req.params;
  const reply = new Comment({
    ...req.body,
    userId: req.user.id,
    parentId,
  });

  const saveReply = await reply.save();

  if (!saveReply) {
    return new (AppErr("unable to reply", 404))();
  }
  res.status(201).json(saveReply);
});

exports.getReplies = catchAsync(async (req, res, next) => {
  const { parentId } = req.params;
  const replies = await Comment.find({ parentId: parentId })
    .sort({ createAt: 1 })
    .exec();

  res.status(200).json(replies);
});

exports.getComments = catchAsync(async (req, res, next) => {
  let filter = {};

  const { postId } = req.params;

  if (postId) filter = { postId, parentId: null };

  const comments = await Comment.find(filter);

  res.status(200).json(comments);
});

exports.editComment = catchAsync(async (req, res, next) => {
  const { commentId } = req.params;
  const { content } = req.body;

  if (!content) {
    return next(new AppErr("Comment text is required.", 400));
  }

  const comment = await Comment.findByIdAndUpdate(
    commentId,
    { content },
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
