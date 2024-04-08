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
  return {
    accessToken: jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
    }),
    refreshToken: jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
    }),
  };
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);
  const accessTokenExpires = process.env.REFRESH_TOKEN_EXPIRES_IN;
  res.cookie("jwt", token.accessToken, {
    expires: new Date(
      Date.now() + process.env.ACCESS_TOKEN_EXPIRES_IN * 60 * 60 * 1000,
    ),
    maxAge: 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });

  // Remove password from output
  user.password = undefined;

  user.refreshToken = token.refreshToken;
  const accessToken = token.accessToken;

  res.status(statusCode).json({
    token: accessToken,
    currentUser: user,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  // creating new user
  const newUser = await User.create(req.body);

  // sending access and refresh token
  createSendToken(newUser, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  // destructuring the email and password
  const { email, password } = req.body;

  // throw and error if there is no email or password
  if (!email || !password) {
    next(new AppErr("Please provide email and password"), 400);
  }

  // we find the email and password in our database
  const user = await User.findOne({ email }).select("+password");

  // if there is no match or the password is wrong, we throw and error
  if (!user || !(await user.correctPassword(password, user.password))) {
    return res.status(401).json({
      status: "failed",
      msg: "Incorrect Details",
    });
  }

  // else we grant them acess and send the neccessary token
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
  console.log(req.cookies.jwt);
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = JSON.parse(req.cookies.jwt);
  }

  if (!token) {
    return next(
      new AppErr("You are not logged in! Please log in to get access.", 401),
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(
    token,
    process.env.ACCESS_TOKEN_SECRET,
  );

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
