const mongoose = require("mongoose");
const CommentSchema = new mongoose.Schema({
  body: {
    type: String,
    required: [true, "Comment must have a content"]
  },
  postId: {
    type: mongoose.Schema.ObjectId,
    ref: "Post",
    required: [true, "Comment must belong to a post"],

  },
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "Comment must show who commented"]
  }
},
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  })
module.exports = mongoose.model("Comment", CommentSchema)