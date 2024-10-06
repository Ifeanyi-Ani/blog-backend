const express = require("express");
const commentController = require("../controllers/commentController");
const { protect } = require("../controllers/authController");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .post(protect, commentController.createComment)
  .get(commentController.getComments);

router
  .route("/:parentId/replies")
  .post(protect, commentController.replyComment)
  .get(commentController.getReplies);

router
  .route("/:commentId")
  .patch(protect, commentController.editComment)
  .delete(protect, commentController.deleteComment);

module.exports = router;
