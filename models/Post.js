const mongoose = require("mongoose");
const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minLength: 1,
      maxLength: 100,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
      minLength: 3,
    },
    likes: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
    tags: [
      {
        text: String,
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    author: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Post must belong to a user"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

PostSchema.virtual("comments", {
  ref: "Comment",
  foreignField: "postId",
  localField: "_id",
});

PostSchema.pre(/^find/, function (next) {
  this.populate({
    path: "author",
  });
  next();
});

module.exports = mongoose.model("Post", PostSchema);
