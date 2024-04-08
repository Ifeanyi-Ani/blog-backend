const catchAsync = require("../utils/catchAsync");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
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
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/posts');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `post-${Math.random() * 20000}-${Date.now()}.${ext}`);
//   }
// });

// const multerFilter = (req, file, cb) => {
//   if (file.mimetype.startsWith('image')) {
//     cb(null, true)
//   } else {
//     cb(new AppErr("Not an image Please upload only images"), false)
//   }
// }
// const upload = multer({
//   storage: multerStorage,
//   fileFilter: multerFilter
// });
exports.uploadPostImage = upload.single("image");

exports.getPost = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const post = await Post.findById(id).populate("comments");

  if (!Post) {
    return next(new AppErr("No Post found with that ID", 404));
  }

  // const post = user._doc;
  res.status(200).json(post);
});

exports.updatePost = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (req.file) {
    const storageRef = ref(
      storage,
      `posts/${req.file.originalname}  ${Math.random() * 20000}`,
    );
    const metadata = req.file.mimtype;
    const snapshot = await uploadBytesResumable(
      storageRef,
      req.file.buffer,
      metadata,
    );
    const downloadUrl = await getDownloadURL(snapshot.ref);
    req.body.image = downloadUrl;
  }

  const post = await Post.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!post) {
    return next(new AppErr("No post found with that ID", 404));
  }
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

exports.createPost = catchAsync(async (req, res, next) => {
  if (req.file) {
    const storageRef = ref(
      storage,
      `posts/${req.file.originalname}  ${Math.random() * 20000}`,
    );
    const metadata = req.file.mimtype;
    const snapshot = await uploadBytesResumable(
      storageRef,
      req.file.buffer,
      metadata,
    );
    const downloadUrl = await getDownloadURL(snapshot.ref);
    if (downloadUrl) {
      req.body.image = downloadUrl;
    }
  }
  const newPost = await Post.create({ ...req.body, userId: req.user.Id });
  res.status(201).json(newPost);
});

exports.getAllPost = catchAsync(async (req, res, next) => {
  const posts = await Post.find();
  res.status(200).json(posts);
});
