const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const bcrypt = require("bcryptjs");
const catchAsync = require("../utils/catchAsync");
const AppErr = require("../utils/appErr");
const { initializeApp } = require("firebase/app");
const {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
} = require("firebase/storage");
const multer = require("multer");
const config = require("../firebase.config");

initializeApp(config.firebaseConfig);

const storage = getStorage();
const upload = multer({ storage: multer.memoryStorage() });

exports.uploadUserPhoto = upload.single("photo");
exports.updateUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  // if (req.file) req.body.photo = req.file.filename
  if (req.file) {
    const storageRef = ref(
      storage,
      `users/${req.file.originalname}  ${Math.random() * 20000}`,
    );
    const metadata = req.file.mimtype;
    const snapshot = await uploadBytesResumable(
      storageRef,
      req.file.buffer,
      metadata,
    );
    const downloadUrl = await getDownloadURL(snapshot.ref);

    req.body.photo = downloadUrl;
  }
  const user = await User.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    return next(new AppErr("No user found with that ID", 404));
  }
  res.status(200).json(user);
});

// exports.deleteUser = catchAsync(async (req, res, next) => {
//   const { id } = req.params
//   const user = await User.findByIdAndDelete(id)
//   if (!user) {
//     return next(new AppErr('No user found with that ID', 404))
//   }
//   res.status(200).json(user)
// })
exports.deleteUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Step 1: Update "likes" array in posts to remove the user's ID
  await Post.updateMany(
    { likes: { $elemMatch: { user: id } } },
    { $pull: { likes: { user: id } } },
  );

  // Step 2: Delete all comments created by the user
  await Comment.deleteMany({ userId: id });

  // Step 3: Delete all posts created by the user
  await Post.deleteMany({ userId: id });

  // Step 4: Delete the user document itself
  const user = await User.findByIdAndDelete(id);
  if (!user) {
    return next(new AppErr("No user found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
  });
});
exports.getUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findById(id).populate("posts");

  if (!user) {
    return next(new AppErr("No user found with that ID", 404));
  }

  // const { password, updatedAt, createdAt, ...other } = user._doc;
  res.status(200).json(user);
});

exports.getAllUser = catchAsync(async (req, res, next) => {
  const user = await User.find();
  res.status(200).json(user);
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

// const filterObj = (obj, ...allowedFields) => {
//   const newObj = {}
//   Object.keys(obj).forEach(el => {
//     if (allowedFields.includes(el)) newObj[el] = obj[el]
//   })
// }
// exports.updateMe = catchAsync(async (req, res, next) => {
//   if (req.body.password || req.body.passwordConfirm) {
//     return next(new AppErr('This route is not for password update. Please use /forgotPassword.', 400))
//   }
//   const filteredBody = filterObj(req.body, 'username', 'category', 'photo')
//   const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
//     new: true,
//     runValidators: true
//   })
//   res.status(200).json({
//     status: "success",
//     data: {
//       user: updatedUser
//     }
//   })
// })
