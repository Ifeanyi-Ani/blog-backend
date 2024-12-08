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
  .route("/:id")
  .patch(protect, commentController.editComment)
  .delete(protect, commentController.deleteComment);

router.post("/:id/likes", protect, commentController.likeComment);

module.exports = router;
