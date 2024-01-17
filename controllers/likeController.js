// Other imports...
const User = require("../models/User");
const Post = require("../models/Post");
const catchAsync = require("../utils/catchAsync");
const AppErr = require("../utils/appErr");
// Like a post
exports.likePost = catchAsync(async (req, res, next) => {
  const { postId } = req.params;
  const { userId } = req.body;

  // Check if the user exists
  const user = await User.findById(userId);
  if (!user) {
    return next(new AppErr("No user found with that ID", 404));
  }

  // Find the post and update the likes
  const post = await Post.findById(postId);
  if (!post) {
    return next(new AppErr("No post found with that ID", 404));
  }

  // Check if the user has already liked the post
  const alreadyLiked = post.likes.some(
    (like) => like.user.toString() === userId,
  );

  const likedIndex = post.likes.findIndex(
    (like) => like.user.toString() === userId,
  );
  if (alreadyLiked) {
    post.likes.splice(likedIndex, 1);
  } else {
    post.likes.push({ user: userId });
  }

  await post.save();

  res.status(200).json(post);
});

// Unlike a post
exports.unlikePost = catchAsync(async (req, res, next) => {
  const { postId } = req.params;
  const { userId } = req.body;

  // Find the post and update the likes
  const post = await Post.findById(postId);
  if (!post) {
    return next(new AppErr("No post found with that ID", 404));
  }

  // Check if the user has liked the post
  const likedIndex = post.likes.findIndex(
    (like) => like.user.toString() === userId,
  );
  if (likedIndex === -1) {
    return next(new AppErr("You have not liked this post", 400));
  }

  post.likes.splice(likedIndex, 1);
  await post.save();

  res.status(200).json(post);
});
