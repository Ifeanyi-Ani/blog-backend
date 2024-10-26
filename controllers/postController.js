const catchAsync = require("../utils/catchAsync");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const AppErr = require("../utils/appErr");

exports.createPost = catchAsync(async (req, res, next) => {
  const data = {
    ...req.body,
    author: req.user.id,
  };

  const newPost = await Post.create(data);
  res.status(201).json(newPost);
});

exports.updatePost = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const post = await Post.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!post) {
    return next(new AppErr("No post found with that ID", 404));
  }
  res.status(200).json(post);
});

exports.getPost = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const post = await Post.findById(id).populate({
    path: "comments",
  });

  if (!Post) {
    return next(new AppErr("No Post found with that ID", 404));
  }

  // const post = user._doc;
  res.status(200).json(post);
});

exports.deletePost = catchAsync(async (req, res, next) => {
  const postId = req.params.id;

  await Comment.deleteMany({ postId: postId });

  const post = await Post.findByIdAndDelete(postId);

  if (!post) {
    return next(new AppErr("No post found with that ID", 404));
  }

  res.status(200).json({
    status: "Post successfully deleted",
  });
});

exports.getAllPost = catchAsync(async (_req, res, _next) => {
  const posts = await Post.find().sort({ createAt: -1 });
  res.status(200).json(posts);
});

exports.likePost = catchAsync(async (req, res, next) => {
  const { id: postId } = req.params;
  const userId = req.user.id;

  const post = await Post.findById(postId);

  if (!post) {
    return next(new AppErr("No Post found with that ID", 404));
  }

  const existingUser = post.likes.includes(userId);

  if (existingUser) {
    post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
  } else {
    post.likes.push(userId);
  }
  await post.save();

  res.status(200).json(post);
});
