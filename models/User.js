const crypto = require("crypto");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const { default: isEmail } = require("validator/lib/isEmail");
const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Provide your username"],
      min: 3,
      max: 50,
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Provide your email"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Provide your password"],
      minlength: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "Please confirm password"],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: "Password are not the same",
      },
    },
    photo: {
      type: String,
      default:
        "https://firebasestorage.googleapis.com/v0/b/blog-460e6.appspot.com/o/users%2Faccc.webp%20%2018578.47943011995?alt=media&token=d4661f07-40dd-4f37-b1dc-950f50933707",
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    dob: {
      type: Date,
      required: [true, "Please input your date of birth"],
    },
    // passwordResetToken: String,
    // passwordResetExpires: Date,
  },

  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

UserSchema.virtual("posts", {
  ref: "Post",
  foreignField: "userId",
  localField: "_id",
});
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  this.passwordConfirm = undefined;
  next();
});
UserSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  try {
    return await bcrypt.compare(candidatePassword, userPassword);
  } catch (error) {
    console.log(error);
  }
};
// UserSchema.methods.createPasswordResetToken = function () {
//   const resetToken = crypto.randomBytes(32).toString('hex');

//   this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

//   this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
//   console.log(resetToken);
//   return resetToken
// }

module.exports = mongoose.model("User", UserSchema);
