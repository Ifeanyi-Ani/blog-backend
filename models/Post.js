const mongoose = require("mongoose");
const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "title most have a title"],
    },
    body: {
      type: String,
    },
    image: {
      type: String,
      default: "",
    },
    category: [
      {
        value: String,
        label: String,
      },
    ],

    likes: [],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    userId: {
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
    path: "userId comments",
  });
  next();
});
module.exports = mongoose.model("Post", PostSchema);
