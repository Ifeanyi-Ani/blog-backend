const express = require("express");
const commentController = require("../controllers/commentController");
const { protect } = require("../controllers/authController");

const router = express.Router();

router
  .route("/:postId")
  .post(protect, commentController.createComment)
  .get(commentController.getComments);

router.post("/:postId/:parentId", commentController.replyComment);

router
  .route("/:postId/:commentId")
  .patch(protect, commentController.editComment)
  .delete(protect, commentController.deleteComment);

router.get("/posts", commentController.getAllComments);

module.exports = router;
