const express = require("express");
const commentController = require("../controllers/commentController");
const { protect } = require("../controllers/authController");

const router = express.Router();

router
  .route("/posts/:postId/comments")
  .post(protect, commentController.createComment)
  .get(commentController.getComments);

router
  .route("/posts/:postId/comments/:commentId")
  .patch(protect, commentController.editComment)
  .delete(protect, commentController.deleteComment);

router.get("/posts/comments", commentController.getAllComments);

module.exports = router;
