const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");

router
  .route("/:id")
  .patch(postController.uploadPostImage, postController.updatePost)
  .delete(postController.deletePost)
  .get(postController.getPost);

router
  .route("/")
  .get(postController.getAllPost)
  .post(postController.uploadPostImage, postController.createPost);

module.exports = router;

