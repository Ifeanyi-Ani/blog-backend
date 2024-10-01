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
    image: {
      type: String,
      default: null,
    },
    tags: [
      {
        id: String,
        text: String,
      },
    ],
    likes: [],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    author: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Post must belong to a user"],
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

PostSchema.virtual("Comments", {
  ref: "Comment",
  foreignField: "postId",
  localField: "_id",
});

PostSchema.pre(/^find/, function (next) {
  this.populate({
    path: "author comments",
  });
  next();
});

module.exports = mongoose.model("Post", PostSchema);
