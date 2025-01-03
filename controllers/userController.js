const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const catchAsync = require("../utils/catchAsync");
const AppErr = require("../utils/appErr");
const factoryHandler = require("./factoryHandlers");

exports.deleteUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  await Post.updateMany(
    { likes: { $elemMatch: { user: id } } },
    { $pull: { likes: { user: id } } },
  );

  await Comment.deleteMany({ userId: id });

  await Post.deleteMany({ userId: id });

  await User.updateMany(
    {
      followers: { $elemMatch: { user: id } },
      following: { $elemMatch: { user: id } },
    },
    { $pull: { followers: { user: id }, following: { user: id } } },
  );

  const user = await User.findByIdAndDelete(id);
  if (!user) {
    return next(new AppErr("No user found with that ID", 404));
  }

  res.status(200).json({
    status: "User successfully deleted",
  });
});

exports.followers = catchAsync(async (req, res) => {
  const { id } = req.params;
  if (req.body.userID !== id) {
    const user = await User.findById(id);
    const currentUser = await User.findById(req.body.userID);
    if (!user.upvotes.includes(req.body.userID)) {
      await user.updateOne({ $push: { upvotes: req.body.userID } });
    } else {
      res.status(403).json("you already follow this user");
    }
  } else {
    res.status(403).json("you can't follow yourself");
  }
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
};

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppErr(
        "This route is not for password update. Please use /changePassword.",
        400,
      ),
    );
  }
  const filteredBody = filterObj(
    req.body,
    "username",
    "bio",
    "photo",
    "gitHub",
    "linkedIn",
  );
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

exports.updateUser = factoryHandler.updateOne(User);

exports.getUser = factoryHandler.getOne(User);

exports.getAllUser = factoryHandler.getAll(User);
