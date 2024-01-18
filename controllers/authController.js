const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("./../models/User");
// const multer = require("multer");
// const bcrypt = require("bcryptjs");
const catchAsync = require("../utils/catchAsync");
const AppErr = require("../utils/appErr");
// const cookie = require("cookie");

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${Math.random() * 20000}-${Date.now()}.${ext}`);
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
// exports.uploadUserPhoto = upload.single('photo')
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken({
    id: user._id,
    username: user.username,
    email: user.email,
    photo: user.photo,
    role: user.role,
  });

  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  });

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json(token);
};
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);

  createSendToken(newUser, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    next(new AppErr("Please provide email and password"), 400);
  }
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return res.status(401).json({
      status: "failed",
      msg: "Incorrect Details",
    });
  }
  createSendToken(user, 200, req, res);
});
exports.logout = (req, res) => {
  res.cookie("jwt", "!currentUser", {
    expires: new Date(Date.now() * 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: "success" });
};
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies;
  }

  if (!token) {
    return next(
      new AppErr("You are not logged in! Please log in to get access.", 401),
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppErr("The user belonging to this token does no longer exist.", 401),
    );
  }

  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppErr("You do not have permission to perform this action", 403),
      );
    }
    next();
  };
};
// exports.forgotPassword = catchAsync(async (req, res, next) => {
//   const user = await User.findOne({ email: req.body.email })
//   if (!user) {
//     return next(new AppErr('There is no user with email address.', 404))
//   }
//   const resetToken = user.createPasswordResetToken()
//   await user.save({ validateBeforeSave: false })

// })
// exports.resetPassword = catchAsync(async (req, res, next) => {

// })
