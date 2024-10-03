const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("./../models/User");
const catchAsync = require("../utils/catchAsync");
const AppErr = require("../utils/appErr");
const sendEmail = require("../utils/email");

const signToken = (id) => {
  return {
    accessToken: jwt.sign({ id }, `${process.env.ACCESS_TOKEN_SECRET}`, {
      expiresIn: parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN) * 60 * 60 * 1000,
    }),
    refreshToken: jwt.sign({ id }, `${process.env.REFRESH_TOKEN_SECRET}`, {
      expiresIn:
        parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN) * 24 * 60 * 60 * 1000,
    }),
  };
};

const createSendToken = (user, statusCode, _req, res) => {
  const token = signToken(user._id);

  res.cookie("jwt", token.refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge:
      parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN) * 24 * 60 * 60 * 1000,
  });

  res.cookie("accessToken", token.accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN) * 60 * 60 * 1000,
  });

  // Remove password from output
  user.password = undefined;

  const accessToken = token.accessToken;

  res.status(statusCode).json({
    token: accessToken,
    currentUser: user,
  });
};

exports.signup = catchAsync(async (req, res, _next) => {
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
    next(new AppErr("Please provide email and password!"), 400);
  }

  // we find the email and password in our database
  const user = await User.findOne({ email }).select("+password");

  // if there is no match or the password is wrong, we throw and error
  if (!user || !(await user.correctPassword(password, user.password))) {
    return res.status(401).json({
      status: "failed",
      message: "Incorrect Details",
    });
  }

  // else we grant them acess and send the neccessary token
  createSendToken(user, 200, req, res);
});

exports.refresh = catchAsync(async (req, res, next) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) return next(new AppErr("unauthenticated", 401));
  const refreshToken = cookies.jwt;

  const decoded = await promisify(jwt.verify)(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
  );
  const currentUser = await User.findById(decoded.id);
  if (!currentUser)
    return next(
      new AppErr("The user belonging to this token does not exit", 401),
    );

  const id = currentUser.id;
  const token = jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN) * 60 * 60 * 1000,
  });

  res.cookie("accessToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN) * 60 * 60 * 1000,
  });
  res.status(200).json({ token, currentUser });
});

exports.logout = catchAsync(async (req, res, next) => {
  const cookies = req.cookies;
  if (!cookies.jwt) return next(new AppErr("", 204));
  res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });
  res.json({ message: "Logged out sucessfully" });
});

exports.getLoggedUser = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const match = User.findById(userId);
  if (!match) return next(new AppErr("Loggedin User not found", 404));
  res.status(200).json({ currentUser: match });
});

exports.protect = catchAsync(async (req, _res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.accessToken) {
    token = req.cookies.accessToken;
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
      new AppErr("The user belonging to this token does no longer exist.", 404),
    );
  }

  req.user = currentUser;
  // res.locals.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, _res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppErr("You do not have permission to perform this action", 403),
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    throw new AppErr("There is no user with that email address!", 404);
  }

  const resetToken = user.CreatePasswordResetCode();
  await user.save({ validateBeforeSave: false });

  const sendResetToken = `Forgot your password? use this reset code ${resetToken}\nIf you didn't initiate this process, please ignore this message`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valild for 10min)",
      message: sendResetToken,
    });
    res
      .status(200)
      .json({ status: "success", message: "Reset code sent to email" });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw new AppErr("There was an Error sending the reset token", 500);
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { pin, newPassword, confirmNewPassword } = req.body;
  if (!pin || !newPassword || !confirmNewPassword) {
    throw new AppErr("All field are required", 400);
  }
  const hashedToken = crypto.createHash("sha256").update(pin).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppErr("Token is Invalid or has Expired", 400);
  }

  user.password = newPassword;
  user.passwordConfirm = confirmNewPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.save();

  createSendToken(user, 200, req, res);
});

exports.changePassword = catchAsync(async (req, res, _next) => {
  const { password, newPassword, confirmNewPassword } = req.body;
  if (!req.user) {
    throw new AppErr("Only loggedin user can change their password", 400);
  }

  if (!password || !newPassword || !confirmNewPassword) {
    throw new AppErr("All field are required", 400);
  }

  if (newPassword !== confirmNewPassword) {
    throw new AppErr("Password does not match", 400);
  }

  const user = await User.findOne({ _id: req.user.id }).select("+password");
  if (!(await user.correctPassword(password, user.password))) {
    throw new AppErr("Incorrect password", 401);
  }

  user.password = newPassword;
  user.passwordConfirm = confirmNewPassword;
  await user.save();
  createSendToken(user, 200, req, res);
});
