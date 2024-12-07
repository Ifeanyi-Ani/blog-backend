const catchAsync = require("../utils/catchAsync");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const AppErr = require("../utils/appErr");
const factoryHandler = require("./factoryHandlers");

exports.createPost = factoryHandler.createOne(Post);

exports.updatePost = factoryHandler.updateOne(Post);

exports.getPost = factoryHandler.getOne(Post, {
  path: "comments",
});

exports.deletePost = factoryHandler.deleteOne(Post);

exports.getAllPost = factoryHandler.getAll(Post);

exports.likePost = factoryHandler.likeOne(Post);
