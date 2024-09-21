const catchAsync = require("../utils/catchAsync");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const AppErr = require("../utils/appErr");




exports.getPost = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const post = await Post.findById(id).populate({
    path: "comments",
    populate: {
      path: "replies",
      populate: {
        path: "replies",
      },
    },
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
    status: "success",
  });
});

  res.status(200).json(posts);
});
