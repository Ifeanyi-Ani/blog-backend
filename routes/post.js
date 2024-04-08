const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const { protect } = require("../controllers/authController");

router
  .route("/:id")
  .patch(protect, postController.uploadPostImage, postController.updatePost)
  .delete(protect, postController.deletePost)
  .get(protect, postController.getPost);

router
  .route("/")
  .get(postController.getAllPost)
  .post(protect, postController.uploadPostImage, postController.createPost);

module.exports = router;
